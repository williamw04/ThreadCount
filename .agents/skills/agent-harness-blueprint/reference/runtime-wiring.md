# Wiring the guard and formatter into an agent runtime

The scripts are runtime-neutral: the guard takes the command as `$1` or as JSON on stdin and answers with exit 0 (allow) or exit 2 (block, reason on stderr). The formatter takes a file path the same way and always exits 0. Each runtime differs only in the event name, the tool matcher, and how it wants the verdict back. Check your runtime's current hook documentation; event names change between versions.

| Runtime | Pre-execution hook | Post-edit hook | Verdict format |
|---|---|---|---|
| Claude Code | `PreToolUse`, matcher `Bash`, settings file `.claude/settings.json` | `PostToolUse`, matcher `Edit\|Write` | JSON on stdin (`tool_input.command`, `tool_input.file_path`); exit 2 blocks |
| Gemini CLI | `BeforeTool`, matcher `run_shell_command`, settings file `.gemini/settings.json` | `AfterTool`, matcher `write_file\|replace` | JSON on stdin (`tool_input`); exit 2 blocks |
| Cursor | `beforeShellExecution` in `.cursor/hooks.json` | `afterFileEdit` | JSON on stdin (`command`, `file_path`); verdict as JSON on stdout, see wrapper below |
| OpenCode | plugin `tool.execute.before` | plugin `tool.execute.after` | JS plugin; throw to block. Shell out to the guard. |
| OpenAI Codex CLI | No command hook. Use its execution-policy rules to forbid the same command prefixes (`git push --force`, `gh pr merge` without `--auto`, `--no-verify`). | none | Policy file |
| Anything else | git `pre-push` hook, see below | git `pre-commit` hook | exit non-zero blocks |

## Claude Code

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.agents/skills/agent-harness-blueprint/reference/command-guard.sh" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.agents/skills/agent-harness-blueprint/reference/format-on-edit.sh", "timeout": 60 }] }
    ]
  }
}
```

## Cursor wrapper (verdict as JSON on stdout)

```bash
#!/bin/bash
# Reads Cursor's {"command": "..."} on stdin, runs the guard, answers in Cursor's format.
set -o pipefail   # a failing jq must deny, not fall through to allow
if reason=$(jq -r '.command' | "$(dirname "$0")/command-guard.sh" 2>&1 >/dev/null); then echo '{"permission":"allow"}'
else jq -n --arg m "${reason:-command guard failed}" '{permission:"deny",user_message:$m,agent_message:$m}'; fi
```

## Runtime without a pre-execution hook

Put the push gate in git itself. This loses the `--no-verify` protection, so the branch rulesets are the only defence against a direct push to a protected branch. They do provide it: a ruleset that requires a pull request rejects direct pushes server-side.

```bash
#!/bin/bash
# .git/hooks/pre-push (or a core.hooksPath directory). Refuses pushes to protected branches and pushes
# of any commit other than the reviewed one.
protected=" ${PROTECTED_BRANCHES:-main develop} "
marker="$(git rev-parse --git-dir)/${REVIEW_MARKER_NAME:-REVIEWED}"
while read -r local_ref local_sha remote_ref remote_sha; do
  case "$remote_ref" in refs/heads/*) ;; *) continue;; esac          # tags and notes are not gated here
  branch=${remote_ref#refs/heads/}
  case "$protected" in *" $branch "*) echo "pre-push: no direct pushes to $branch, open a PR" >&2; exit 1;; esac
  case "$local_sha" in 0000000000*) continue;; esac                  # branch deletion carries no commit
  [ "$(cat "$marker" 2>/dev/null)" = "$local_sha" ] || { echo "pre-push: ${local_sha:0:7} has not been reviewed; run mark-reviewed.sh after validation" >&2; exit 1; }
done
```

## PR watch

The session that opened a PR should learn about CI failures, merge conflicts, and review comments without being asked. Runtimes that bind a session to a PR do this natively; enable it right after opening the PR. Otherwise poll:

```bash
gh pr checks --watch --fail-fast
gh api repos/{owner}/{repo}/pulls/{number}/comments
```

## Arming auto-merge from the shell

```bash
gh pr merge --auto --squash <number>
```

This is the only merge-shaped command the guard allows. The platform performs the merge when the rulesets are satisfied.
