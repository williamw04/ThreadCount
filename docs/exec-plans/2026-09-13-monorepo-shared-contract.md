# Monorepo and Shared Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the repo into npm workspaces with the web app at `apps/web` and a new `packages/shared` package that holds the enums, entity schemas, and the typed API contract both future clients and the future Worker will build against. No behavior change to the running app.

**Architecture:** One root `package.json` with `workspaces: ["apps/*", "packages/*"]` and a single root lockfile. `apps/web` is the existing React app moved with `git mv`. `packages/shared` exports TypeScript source directly (no build step); Vite, Vitest, and tsc all resolve it through the package `exports` field. The web app consumes only the enums from shared in this sub-project; the entity schemas and route table describe the new API from the spec and are consumed by nothing yet, but are fully unit-tested so sub-project 2 builds the Worker against a fixed contract. `backend/` and `docs/` are untouched and stay outside the workspaces.

**Tech Stack:** npm workspaces, TypeScript 5.9, Zod 4, Vitest 5, ESLint 10 flat config, Prettier 3, husky 9, lint-staged 17.

**Spec:** `docs/decisions/cloudflare-architecture.md`, sections Repository Layout, Data Model, API Surface, Sub-projects (item 1).

## Global Constraints

- No behavior change: the web app keeps calling the current FastAPI and Supabase endpoints exactly as today. The new contract is not wired to anything.
- The three required CI checks keep their names: `Frontend checks`, `Backend checks`, `Documentation build`. Shared-package checks run as steps inside `Frontend checks`.
- Every pre-existing gate stays green: typecheck, eslint, prettier, vitest coverage floors (lines 11, statements 11, functions 14, branches 12), build, ruff, pytest at 45 percent.
- File size limit 300 lines. Layer rule Types to API to Stores to Components to Pages, enforced by eslint.
- Field names in the new contract are camelCase, matching Better Auth's user table, which the Worker will use. The current API is snake_case; the two coexist until sub-project 2 switches the web app over.
- The spec says "define the API contract as Hono route types". This plan defines it as a plain typed route table over Zod schemas with no Hono dependency, so the shared package stays runtime-neutral. Sub-project 2 derives the Hono handlers and the RPC client from this table. That is a deliberate narrowing of the spec wording, not of its intent.
- Work in a git worktree on a branch cut from `develop`. PR into `develop` with auto-fix and auto-merge (squash), per `docs/decisions/merge-policy.md`.

---

## File Structure

Created:
- `package.json` (root): workspaces, husky.
- `package-lock.json` (root): replaces `frontend/package-lock.json`.
- `.prettierrc`, `.prettierignore` (root): moved from the web app so both packages share them.
- `packages/shared/package.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`.
- `packages/shared/src/index.ts`: barrel.
- `packages/shared/src/enums.ts`: categories, seasons, job statuses, colors. One file, one purpose: the closed vocabularies the database CHECK constraints enforce.
- `packages/shared/src/enums.test.ts`.
- `packages/shared/src/schemas.ts`: entity schemas for the new API, one per table plus the error shape.
- `packages/shared/src/schemas.test.ts`.
- `packages/shared/src/contract.ts`: request schemas and the route table.
- `packages/shared/src/contract.test.ts`.

Moved:
- `frontend/` to `apps/web/` in full, by `git mv`, so history follows.

Modified:
- `apps/web/package.json`: drop `prepare` and `husky`, add the shared dependency.
- `apps/web/src/features/wardrobe/types.ts`: re-export enums from shared.
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/dependabot.yml`: paths and the root lockfile.
- `.husky/pre-commit`, `.husky/pre-push`, `.claude/hooks/format.sh`, `.claude/skills/feature-pipeline/SKILL.md`: paths.
- `.gitignore`: env example path.
- `docker-compose.dev.yml`, `docker-compose.prod.yml`, `docker/frontend/Dockerfile`, `docker/frontend/Dockerfile.prod`: workspace-aware build.
- `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `docs/**/*.md`: path references.
- `docs/getting-started/architecture.md`: repository layout.
- `docs/references/api-contracts.md`: pointer to the new contract.

---

### Task 1: npm workspaces and move the web app

**Files:**
- Create: `package.json`
- Move: `frontend/` to `apps/web/`
- Modify: `apps/web/package.json`
- Delete: `apps/web/package-lock.json`, old root `package-lock.json`
- Modify: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/dependabot.yml`, `.husky/pre-commit`, `.husky/pre-push`, `.claude/hooks/format.sh`, `.claude/skills/feature-pipeline/SKILL.md`, `.gitignore`, `docker-compose.dev.yml`, `docker-compose.prod.yml`, `docker/frontend/Dockerfile`, `docker/frontend/Dockerfile.prod`
- Modify: `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, every `docs/**/*.md` that contains `frontend/`

**Interfaces:**
- Consumes: nothing.
- Produces: a root workspace where `npm ci` at the root installs everything and `npm run <script> -w apps/web` runs the web app's scripts. Later tasks add `packages/shared` as a second workspace.

- [ ] **Step 1: Create the root package.json**

```json
{
  "name": "seamless",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

- [ ] **Step 2: Move the web app with history**

```bash
mkdir -p apps
git mv frontend apps/web
git rm -q apps/web/package-lock.json package-lock.json
rm -rf apps/web/node_modules
```

- [ ] **Step 3: Edit apps/web/package.json**

Remove these two lines from `scripts`:

```json
    "lint-staged": "lint-staged",
    "prepare": "cd .. && husky"
```

Remove this line from `devDependencies`:

```json
    "husky": "^9.1.7",
```

Change `"name": "seamless-frontend"` to `"name": "@seamless/web"`.

- [ ] **Step 4: Install at the root and commit the new lockfile**

```bash
npm install
git add package.json package-lock.json apps/web/package.json
```

Expected: a root `package-lock.json` is created, `node_modules/` exists at the root, `apps/web/node_modules` does not exist or contains only a `.bin` link.

- [ ] **Step 5: Verify the web app still works from the workspace**

```bash
npm run typecheck -w apps/web && npm run lint -w apps/web && npm run format:check -w apps/web && npm run test:coverage -w apps/web && npm run build -w apps/web
```

Expected: all pass, 45 tests, coverage above the floors.

- [ ] **Step 6: Replace the frontend job in .github/workflows/ci.yml**

Replace the whole `frontend:` job with:

```yaml
  frontend:
    name: Frontend checks
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: package-lock.json
      - name: Install dependencies
        working-directory: .
        run: npm ci
      - name: Type check
        run: npm run typecheck
      - name: Lint
        run: npm run lint
      - name: Format check
        run: npm run format:check
      - name: Test (with coverage floor)
        run: npm run test:coverage
      - name: Build
        run: npm run build
```

Keep the action versions that are already on the branch if they differ from `v7`; only the paths change.

- [ ] **Step 7: Update .github/workflows/deploy.yml**

In both jobs, change every `cache-dependency-path: frontend/package-lock.json` to `cache-dependency-path: package-lock.json`, change the `Install dependencies` step to run at the root:

```yaml
      - name: Install dependencies
        run: npm ci
```

and change every other `working-directory: frontend` to `working-directory: apps/web`.

Manual prerequisite, outside the repo: in the Vercel project settings, set Root Directory to `apps/web`. Until that is done, preview deploys fail at the Vercel step; CI is unaffected. Vercel is replaced in sub-project 2.

- [ ] **Step 8: Update .github/dependabot.yml**

Replace the npm entry for `/frontend` with one root entry that covers all workspaces:

```yaml
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups: { workspaces: { patterns: ["*"] } }
    ignore:
      # typescript-eslint does not support TypeScript 7 yet; drop this when it does.
      - dependency-name: typescript
        update-types: ["version-update:semver-major"]
```

Keep the `/docs`, `/backend`, and github-actions entries as they are, including any `target-branch` line already present.

- [ ] **Step 9: Update the husky hooks**

`.husky/pre-commit`:

```sh
# Fast, staged-only. Slow checks live in pre-push and CI.
(cd apps/web && npx lint-staged)
py=$(git diff --cached --name-only --diff-filter=ACM -- '*.py')
if [ -n "$py" ]; then
  RUFF=backend/.venv/bin/ruff; [ -x "$RUFF" ] || RUFF=ruff
  $RUFF format $py && $RUFF check --fix $py && git add $py
fi
```

`.husky/pre-push`:

```sh
npm run typecheck -w apps/web && npm run test:run -w apps/web
cd backend; PY=.venv/bin/python; [ -x "$PY" ] || PY=python3; $PY -m pytest -q
```

- [ ] **Step 10: Update .claude/hooks/format.sh**

Replace the `case` block with:

```bash
case "$f" in
  */backend/*.py)
    RUFF=backend/.venv/bin/ruff; [ -x "$RUFF" ] || RUFF=$(command -v ruff) || { echo "ruff not installed; skipped" >&2; exit 0; }
    $RUFF format "$f" && $RUFF check --fix "$f" ;;
  */apps/web/*.ts|*/apps/web/*.tsx)
    cd apps/web && npx prettier --write "$f" >/dev/null && npx eslint --fix "$f" ;;
  */packages/shared/*.ts)
    cd packages/shared && npx prettier --write "$f" >/dev/null && npx eslint --fix "$f" ;;
esac
```

- [ ] **Step 11: Update the gate commands in .claude/skills/feature-pipeline/SKILL.md**

Replace the fenced block under "3. Self-check" with:

```bash
npm ci
npm run typecheck -w apps/web && npm run lint -w apps/web && npm run format:check -w apps/web && npm run test:coverage -w apps/web && npm run build -w apps/web
npm run typecheck -w packages/shared && npm run lint -w packages/shared && npm run format:check -w packages/shared && npm run test -w packages/shared
cd backend && ruff check . && ruff format --check . && pytest
```

- [ ] **Step 12: Update .gitignore, docker-compose, and Dockerfiles**

`.gitignore`: change `!frontend/.env.example` to `!apps/web/.env.example`.

`docker-compose.dev.yml`, in the `frontend` service: change `- ./frontend:/app` to `- ./apps/web:/app/apps/web` and add `- ./packages:/app/packages` on the next line. Leave the service name alone; it is a compose name, not a path.

`docker/frontend/Dockerfile`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci
COPY apps/web apps/web
COPY packages/shared packages/shared
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

`docker/frontend/Dockerfile.prod`: keep the nginx stage as it is; replace the build stage with the same lines as above up to `WORKDIR /app/apps/web`, then `RUN npm run build`, and change the copy into nginx to `COPY --from=build /app/apps/web/build /usr/share/nginx/html`. Read the existing file first and keep its stage names and the `nginx.conf` copy line.

`packages/shared/package.json` does not exist until Task 2. The Dockerfiles reference it, so Docker builds fail between Task 1 and Task 2. That is acceptable: nothing in CI builds the images, and both tasks land in one PR.

- [ ] **Step 13: Rewrite path references in docs and root markdown**

```bash
grep -rlE '(^|[^/])frontend/' AGENTS.md CONTRIBUTING.md README.md docs --include='*.md' --exclude-dir=node_modules --exclude-dir=build --exclude-dir=.docusaurus \
  | xargs sed -i '' -E 's#(^|[^/])frontend/#\1apps/web/#g; s#cd frontend#cd apps/web#g'
git diff --stat -- '*.md' | tail -1
```

The `[^/]` guard leaves `docker/frontend/` alone. Then read the diff of `AGENTS.md`, `CONTRIBUTING.md`, and `docs/getting-started/setup.md` in full and fix any sentence the substitution made wrong.

- [ ] **Step 14: Verify everything, including the hooks**

```bash
npm ci
npm run typecheck -w apps/web && npm run lint -w apps/web && npm run format:check -w apps/web && npm run test:coverage -w apps/web && npm run build -w apps/web
.claude/hooks/check.sh
git config core.hooksPath
cd docs && npm run build
```

Expected: all pass; `core.hooksPath` prints `.husky/_`; docs build succeeds. Then `git status --short` shows only the intended files.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "chore: npm workspaces; move frontend to apps/web

Root package.json with workspaces and a single lockfile. Web app moved
with git mv. CI, deploy, dependabot, husky, hooks, docker, and docs
paths updated. No behavior change."
```

---

### Task 2: packages/shared with the enums, consumed by the web app

**Files:**
- Move: `apps/web/.prettierrc` to `.prettierrc`, `apps/web/.prettierignore` to `.prettierignore`
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/eslint.config.js`, `packages/shared/vitest.config.ts`, `packages/shared/src/index.ts`, `packages/shared/src/enums.ts`
- Test: `packages/shared/src/enums.test.ts`
- Modify: `apps/web/package.json`, `apps/web/src/features/wardrobe/types.ts`, `.github/workflows/ci.yml`, `.husky/pre-commit`, `.husky/pre-push`, `docs/getting-started/architecture.md`

**Interfaces:**
- Consumes: the workspace from Task 1.
- Produces: package `@seamless/shared` exporting `CATEGORIES`, `Category`, `SEASONS`, `Season`, `JOB_STATUSES`, `JobStatus`, `COMMON_COLORS`, `CommonColor`. Tasks 3 and 4 import `CATEGORIES`, `SEASONS`, and `JOB_STATUSES` from `./enums`.

- [ ] **Step 1: Move Prettier config to the root**

```bash
git mv apps/web/.prettierrc .prettierrc
git mv apps/web/.prettierignore .prettierignore
```

Append `docs` and `backend` to `.prettierignore` so a root-level `prettier --check .` never touches them:

```
build
node_modules
package-lock.json
docs
backend
```

Prettier resolves config upward from each file, so `apps/web` keeps working unchanged.

- [ ] **Step 2: Create packages/shared/package.json**

```json
{
  "name": "@seamless/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run"
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{js,json,md}": "prettier --write"
  },
  "dependencies": {
    "zod": "^4.6.2"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.10.0",
    "eslint-config-prettier": "^10.1.8",
    "prettier": "^3.9.6",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.70.0",
    "vitest": "^5.0.0"
  }
}
```

Version numbers match `apps/web/package.json` so npm dedupes them to one copy.

- [ ] **Step 3: Create packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "vitest.config.ts"]
}
```

- [ ] **Step 4: Create packages/shared/eslint.config.js and vitest.config.ts**

`eslint.config.js`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  eslintConfigPrettier,
);
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
```

- [ ] **Step 5: Write the failing enums test**

`packages/shared/src/enums.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CATEGORIES, COMMON_COLORS, JOB_STATUSES, SEASONS } from './enums';

describe('enums', () => {
  it('have no duplicate values', () => {
    for (const list of [CATEGORIES, SEASONS, JOB_STATUSES, COMMON_COLORS]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('match the database CHECK constraints from the migrations', () => {
    expect(CATEGORIES).toEqual(['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear']);
    expect(SEASONS).toEqual(['spring', 'summer', 'fall', 'winter']);
    expect(JOB_STATUSES).toEqual(['pending', 'processing', 'ready', 'failed']);
  });
});
```

- [ ] **Step 6: Install and run the test to verify it fails**

```bash
npm install
npm test -w packages/shared
```

Expected: FAIL, cannot find module `./enums`.

- [ ] **Step 7: Create packages/shared/src/enums.ts and index.ts**

`enums.ts`:

```ts
/**
 * Closed vocabularies. These are the values the database CHECK constraints
 * accept, so a change here is a migration, not just an edit.
 */
export const CATEGORIES = ['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear'] as const;
export type Category = (typeof CATEGORIES)[number];

export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

/** Lifecycle of a fal.ai job: avatar generation, try-on, background removal. */
export const JOB_STATUSES = ['pending', 'processing', 'ready', 'failed'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Color names the analysis endpoint returns. The web color filter maps these to hex. */
export const COMMON_COLORS = [
  'black', 'white', 'gray', 'navy', 'blue', 'red', 'green', 'yellow', 'orange', 'pink',
  'purple', 'brown', 'beige', 'cream', 'tan', 'burgundy', 'teal', 'coral', 'olive', 'charcoal',
] as const;
export type CommonColor = (typeof COMMON_COLORS)[number];
```

`index.ts`:

```ts
export * from './enums';
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
npm test -w packages/shared && npm run typecheck -w packages/shared && npm run lint -w packages/shared && npm run format:check -w packages/shared
```

Expected: 2 tests pass, no type, lint, or format errors. Prettier will reformat the `COMMON_COLORS` array onto multiple lines; run `npx prettier --write src` in `packages/shared` and re-check.

- [ ] **Step 9: Make the web app consume the enums**

Add to `dependencies` in `apps/web/package.json`:

```json
    "@seamless/shared": "*",
```

Run `npm install` at the root so npm links the workspace.

Replace the top of `apps/web/src/features/wardrobe/types.ts`, from the first line through the end of the `Season` type, with:

```ts
import type { Category, Season } from '@seamless/shared';
import { CATEGORIES, COMMON_COLORS, SEASONS } from '@seamless/shared';

export type { Category, Season };
```

Delete the local `CATEGORIES`, `SEASONS`, and `COMMON_COLORS` constants further down the file and replace them with:

```ts
export { CATEGORIES, SEASONS, COMMON_COLORS };
```

Keep `CATEGORY_LABELS` and `SEASON_LABELS` in the web app; labels are presentation.

- [ ] **Step 10: Verify the web app**

```bash
npm run typecheck -w apps/web && npm run lint -w apps/web && npm run test:coverage -w apps/web && npm run build -w apps/web
```

Expected: PASS. The shared arrays are `readonly` tuples. If typecheck reports a `readonly` error at a call site, that site mutates or assigns the constant to a mutable array type; fix it there by spreading, for example `[...CATEGORIES]`, not by removing `as const` in shared. If typecheck reports it cannot find `@seamless/shared`, add to `compilerOptions.paths` in `apps/web/tsconfig.app.json`:

```json
      "@seamless/shared": ["../../packages/shared/src/index.ts"]
```

- [ ] **Step 11: Add the shared checks to CI and the hooks**

In `.github/workflows/ci.yml`, in the `frontend` job, add this step directly after `Install dependencies`:

```yaml
      - name: Shared package checks
        working-directory: packages/shared
        run: npm run typecheck && npm run lint && npm run format:check && npm test
```

`.husky/pre-commit`: add `(cd packages/shared && npx lint-staged)` on the line after the `apps/web` lint-staged line.

`.husky/pre-push`: change the first line to:

```sh
npm run typecheck -w apps/web && npm run test:run -w apps/web && npm test -w packages/shared
```

- [ ] **Step 12: Record the layout in docs/getting-started/architecture.md**

Add this section after the tech stack tables:

```markdown
## Repository Layout

npm workspaces. Install once at the root with `npm ci`; run a package's scripts with `npm run <script> -w <package>`.

| Path | Package | Purpose |
|---|---|---|
| `apps/web` | `@seamless/web` | React web app (moved from `frontend/`) |
| `packages/shared` | `@seamless/shared` | Enums, entity schemas, and the typed API contract shared by every client and the API |
| `backend` | Python, not a workspace | FastAPI backend, replaced in the Cloudflare migration |
| `docs` | own lockfile, not a workspace | This Docusaurus site |

`packages/shared` exports TypeScript source; there is no build step. Vite, Vitest, and tsc resolve it through the package `exports` field.
```

- [ ] **Step 13: Full gate and commit**

```bash
npm run typecheck -w apps/web && npm run lint -w apps/web && npm run format:check -w apps/web && npm run test:coverage -w apps/web && npm run build -w apps/web
npm run typecheck -w packages/shared && npm run lint -w packages/shared && npm run format:check -w packages/shared && npm test -w packages/shared
cd docs && npm run build && cd ..
git add -A
git commit -m "feat(shared): packages/shared with the closed vocabularies; web consumes them

New @seamless/shared workspace exporting CATEGORIES, SEASONS,
JOB_STATUSES, COMMON_COLORS and their types. The web wardrobe types
re-export them. Prettier config moves to the root. CI and hooks run the
shared checks."
```

---

### Task 3: Entity schemas for the new API

**Files:**
- Create: `packages/shared/src/schemas.ts`
- Test: `packages/shared/src/schemas.test.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: `CATEGORIES`, `SEASONS`, `JOB_STATUSES` from `./enums`.
- Produces: `UserSchema`, `AvatarSchema`, `WardrobeItemSchema`, `OutfitSchema`, `GeneratedImageSchema`, `ApiErrorSchema`, and the inferred types `User`, `Avatar`, `WardrobeItem`, `Outfit`, `GeneratedImage`, `ApiError`. Task 4 uses every schema as a route response.

- [ ] **Step 1: Write the failing schema tests**

`packages/shared/src/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  ApiErrorSchema,
  AvatarSchema,
  GeneratedImageSchema,
  OutfitSchema,
  UserSchema,
  WardrobeItemSchema,
} from './schemas';

const now = '2026-09-13T12:00:00.000Z';
const id = '0d5d3c2e-7c1b-4f4a-9c2e-8f2b9b1e6a11';

describe('entity schemas', () => {
  it('parses a user', () => {
    const user = UserSchema.parse({
      id,
      email: 'a@b.co',
      name: null,
      image: null,
      emailVerified: true,
      onboardingCompleted: false,
      tutorialCompleted: false,
      createdAt: now,
      updatedAt: now,
    });
    expect(user.email).toBe('a@b.co');
  });

  it('parses an avatar with a presigned url next to each key', () => {
    const avatar = AvatarSchema.parse({
      id,
      userId: id,
      originalKey: `avatars/${id}/original.jpg`,
      originalUrl: 'https://r2.example/signed',
      modelKey: null,
      modelUrl: null,
      status: 'processing',
      error: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    expect(avatar.status).toBe('processing');
  });

  it('rejects a wardrobe item with an unknown category', () => {
    const result = WardrobeItemSchema.safeParse({
      id,
      userId: id,
      name: 'Coat',
      category: 'hats',
      imageKey: `wardrobe/${id}/x.png`,
      imageUrl: 'https://r2.example/signed',
      status: 'ready',
      error: null,
      labels: [],
      colors: [],
      seasons: [],
      isInspiration: false,
      createdAt: now,
      updatedAt: now,
    });
    expect(result.success).toBe(false);
  });

  it('parses an outfit and a generated image', () => {
    expect(
      OutfitSchema.parse({
        id,
        userId: id,
        name: null,
        itemIds: [id],
        thumbnailKey: null,
        thumbnailUrl: null,
        createdAt: now,
        updatedAt: now,
      }).itemIds,
    ).toEqual([id]);
    expect(
      GeneratedImageSchema.parse({
        id,
        userId: id,
        outfitId: null,
        imageKey: null,
        imageUrl: null,
        prompt: 'p',
        status: 'failed',
        error: 'fal.ai timeout',
        createdAt: now,
      }).error,
    ).toBe('fal.ai timeout');
  });

  it('parses the error envelope', () => {
    expect(ApiErrorSchema.parse({ error: { code: 'not_found', message: 'No such item' } }).error.code).toBe(
      'not_found',
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -w packages/shared
```

Expected: FAIL, cannot find module `./schemas`.

- [ ] **Step 3: Create packages/shared/src/schemas.ts**

```ts
import { z } from 'zod';
import { CATEGORIES, JOB_STATUSES, SEASONS } from './enums';

/**
 * Entity shapes returned by the API. Field names are camelCase (the Worker
 * and Better Auth use them as-is). Media columns hold R2 keys; the API adds a
 * presigned URL next to each key when it returns a row, valid for one hour.
 */

const Id = z.uuid();
const Timestamp = z.iso.datetime();
const Key = z.string().min(1);
const SignedUrl = z.url();

export const UserSchema = z.object({
  id: Id,
  email: z.email(),
  name: z.string().nullable(),
  image: SignedUrl.nullable(),
  emailVerified: z.boolean(),
  onboardingCompleted: z.boolean(),
  tutorialCompleted: z.boolean(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type User = z.infer<typeof UserSchema>;

export const AvatarSchema = z.object({
  id: Id,
  userId: Id,
  originalKey: Key,
  originalUrl: SignedUrl,
  modelKey: Key.nullable(),
  modelUrl: SignedUrl.nullable(),
  status: z.enum(JOB_STATUSES),
  error: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type Avatar = z.infer<typeof AvatarSchema>;

/** Background removal is a job, so an item carries a status like the other two job types. */
export const WardrobeItemSchema = z.object({
  id: Id,
  userId: Id,
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  imageKey: Key,
  imageUrl: SignedUrl,
  status: z.enum(['processing', 'ready', 'failed']),
  error: z.string().nullable(),
  labels: z.array(z.string()),
  colors: z.array(z.string()),
  seasons: z.array(z.enum(SEASONS)),
  isInspiration: z.boolean(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type WardrobeItem = z.infer<typeof WardrobeItemSchema>;

export const OutfitSchema = z.object({
  id: Id,
  userId: Id,
  name: z.string().nullable(),
  itemIds: z.array(Id),
  thumbnailKey: Key.nullable(),
  thumbnailUrl: SignedUrl.nullable(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type Outfit = z.infer<typeof OutfitSchema>;

export const GeneratedImageSchema = z.object({
  id: Id,
  userId: Id,
  outfitId: Id.nullable(),
  imageKey: Key.nullable(),
  imageUrl: SignedUrl.nullable(),
  prompt: z.string(),
  status: z.enum(['processing', 'ready', 'failed']),
  error: z.string().nullable(),
  createdAt: Timestamp,
});
export type GeneratedImage = z.infer<typeof GeneratedImageSchema>;

/** Every non-2xx response. Codes: validation, unauthorized, not_found, upstream. */
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.enum(['validation', 'unauthorized', 'not_found', 'upstream']),
    message: z.string(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
```

Add to `index.ts`:

```ts
export * from './schemas';
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test -w packages/shared && npm run typecheck -w packages/shared && npm run lint -w packages/shared && npm run format:check -w packages/shared
```

Expected: 7 tests pass across both files. If `z.uuid`, `z.email`, `z.url`, or `z.iso.datetime` is reported as not a function, the installed Zod is older than 4; check `node_modules/zod/package.json` and use `z.string().uuid()`, `z.string().email()`, `z.string().url()`, `z.string().datetime()` instead. Zod 4.6 is what `apps/web` pins, so this should not happen.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas.ts packages/shared/src/schemas.test.ts packages/shared/src/index.ts
git commit -m "feat(shared): entity schemas for the new API

User, Avatar, WardrobeItem, Outfit, GeneratedImage, ApiError, per the
data model in docs/decisions/cloudflare-architecture.md. camelCase,
R2 keys with presigned URLs alongside, job status on every job type."
```

---

### Task 4: Request schemas and the route table

**Files:**
- Create: `packages/shared/src/contract.ts`
- Test: `packages/shared/src/contract.test.ts`
- Modify: `packages/shared/src/index.ts`, `docs/references/api-contracts.md`

**Interfaces:**
- Consumes: every schema from Task 3 and `CATEGORIES`, `SEASONS` from `./enums`.
- Produces: `contract`, a frozen object of named routes, each `{ method, path, params?, query?, body?, response }`; the types `RouteDef`, `RouteName`, `RequestBodyOf`, `ResponseOf`; and the request schemas listed in Step 3. Sub-project 2 imports `contract` to build the Hono app and the client.

- [ ] **Step 1: Write the failing contract tests**

`packages/shared/src/contract.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  contract,
  CreateGeneratedImageRequest,
  CreateWardrobeItemRequest,
  PresignUploadRequest,
} from './contract';

const routes = Object.entries(contract);

describe('route table', () => {
  it('has unique method plus path pairs', () => {
    const keys = routes.map(([, r]) => `${r.method} ${r.path}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('declares params exactly when the path has a parameter', () => {
    for (const [name, r] of routes) {
      const hasParam = r.path.includes(':');
      expect(Boolean(r.params), `${name} params`).toBe(hasParam);
    }
  });

  it('never sends a body on GET or DELETE', () => {
    for (const [name, r] of routes) {
      if (r.method === 'GET' || r.method === 'DELETE') {
        expect(r.body, `${name} body`).toBeUndefined();
      }
    }
  });

  it('covers every resource in the spec', () => {
    const names = Object.keys(contract);
    for (const expected of [
      'me', 'updateMe', 'presignUpload',
      'listAvatars', 'createAvatar', 'getAvatar', 'generateAvatar', 'deleteAvatar',
      'listWardrobeItems', 'createWardrobeItem', 'getWardrobeItem', 'updateWardrobeItem',
      'deleteWardrobeItem', 'analyzeWardrobeImage',
      'listOutfits', 'createOutfit', 'getOutfit', 'updateOutfit', 'deleteOutfit',
      'listGeneratedImages', 'createGeneratedImage', 'getGeneratedImage', 'deleteGeneratedImage',
    ]) {
      expect(names, expected).toContain(expected);
    }
  });
});

describe('request schemas', () => {
  it('rejects an upload kind or content type outside the allow list', () => {
    expect(PresignUploadRequest.safeParse({ kind: 'avatar', contentType: 'image/gif' }).success).toBe(false);
    expect(PresignUploadRequest.safeParse({ kind: 'video', contentType: 'image/png' }).success).toBe(false);
    expect(PresignUploadRequest.safeParse({ kind: 'wardrobe', contentType: 'image/png' }).success).toBe(true);
  });

  it('defaults the label arrays on create', () => {
    const item = CreateWardrobeItemRequest.parse({ name: 'Coat', category: 'outerwear', imageKey: 'wardrobe/u/x.png' });
    expect(item.labels).toEqual([]);
    expect(item.seasons).toEqual([]);
  });

  it('requires either an outfit id or at least one item id for a try-on', () => {
    expect(CreateGeneratedImageRequest.safeParse({}).success).toBe(false);
    expect(CreateGeneratedImageRequest.safeParse({ itemIds: [] }).success).toBe(false);
    expect(CreateGeneratedImageRequest.safeParse({ outfitId: '0d5d3c2e-7c1b-4f4a-9c2e-8f2b9b1e6a11' }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -w packages/shared
```

Expected: FAIL, cannot find module `./contract`.

- [ ] **Step 3: Create packages/shared/src/contract.ts**

```ts
import { z } from 'zod';
import { CATEGORIES, SEASONS } from './enums';
import {
  AvatarSchema,
  GeneratedImageSchema,
  OutfitSchema,
  UserSchema,
  WardrobeItemSchema,
} from './schemas';

/**
 * The API contract. Each route names its method, path, and the Zod schemas for
 * params, query, body, and response. The Worker validates requests against these
 * and the clients type their calls from them. The fal.ai webhook is not here: it
 * is called by fal.ai, not by a client.
 */

const Id = z.uuid();
const IdParams = z.object({ id: Id });
const NoContent = z.undefined();

// --- request schemas ---

export const PatchMeRequest = z.object({
  onboardingCompleted: z.boolean().optional(),
  tutorialCompleted: z.boolean().optional(),
});

export const PresignUploadRequest = z.object({
  kind: z.enum(['avatar', 'wardrobe', 'generated']),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});
export const PresignUploadResponse = z.object({
  key: z.string().min(1),
  url: z.url(),
  expiresAt: z.iso.datetime(),
});

export const CreateAvatarRequest = z.object({ originalKey: z.string().min(1) });

export const ListWardrobeItemsQuery = z.object({
  category: z.enum(CATEGORIES).optional(),
  search: z.string().optional(),
  colors: z.array(z.string()).optional(),
  seasons: z.array(z.enum(SEASONS)).optional(),
});
export const CreateWardrobeItemRequest = z.object({
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  imageKey: z.string().min(1),
  labels: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  seasons: z.array(z.enum(SEASONS)).default([]),
});
export const UpdateWardrobeItemRequest = CreateWardrobeItemRequest.omit({ imageKey: true }).partial();

export const AnalyzeWardrobeImageRequest = z.object({ imageKey: z.string().min(1) });
export const AnalyzeWardrobeImageResponse = z.object({
  name: z.string(),
  category: z.enum(CATEGORIES),
  colors: z.array(z.string()),
  seasons: z.array(z.enum(SEASONS)),
  labels: z.array(z.string()),
});

export const CreateOutfitRequest = z.object({
  name: z.string().optional(),
  itemIds: z.array(Id).default([]),
  thumbnailKey: z.string().min(1).optional(),
});
export const UpdateOutfitRequest = CreateOutfitRequest.partial();

export const CreateGeneratedImageRequest = z.union([
  z.object({ outfitId: Id }),
  z.object({ itemIds: z.array(Id).min(1) }),
]);

// --- route table ---

export interface RouteDef {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: `/api/${string}`;
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
  response: z.ZodType;
}

const route = <R extends RouteDef>(r: R): R => r;

export const contract = {
  me: route({ method: 'GET', path: '/api/me', response: UserSchema }),
  updateMe: route({ method: 'PATCH', path: '/api/me', body: PatchMeRequest, response: UserSchema }),

  presignUpload: route({
    method: 'POST',
    path: '/api/uploads/presign',
    body: PresignUploadRequest,
    response: PresignUploadResponse,
  }),

  listAvatars: route({ method: 'GET', path: '/api/avatars', response: z.array(AvatarSchema) }),
  createAvatar: route({ method: 'POST', path: '/api/avatars', body: CreateAvatarRequest, response: AvatarSchema }),
  getAvatar: route({ method: 'GET', path: '/api/avatars/:id', params: IdParams, response: AvatarSchema }),
  generateAvatar: route({
    method: 'POST',
    path: '/api/avatars/:id/generate',
    params: IdParams,
    response: AvatarSchema,
  }),
  deleteAvatar: route({ method: 'DELETE', path: '/api/avatars/:id', params: IdParams, response: NoContent }),

  listWardrobeItems: route({
    method: 'GET',
    path: '/api/wardrobe/items',
    query: ListWardrobeItemsQuery,
    response: z.array(WardrobeItemSchema),
  }),
  createWardrobeItem: route({
    method: 'POST',
    path: '/api/wardrobe/items',
    body: CreateWardrobeItemRequest,
    response: WardrobeItemSchema,
  }),
  getWardrobeItem: route({
    method: 'GET',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    response: WardrobeItemSchema,
  }),
  updateWardrobeItem: route({
    method: 'PATCH',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    body: UpdateWardrobeItemRequest,
    response: WardrobeItemSchema,
  }),
  deleteWardrobeItem: route({
    method: 'DELETE',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    response: NoContent,
  }),
  analyzeWardrobeImage: route({
    method: 'POST',
    path: '/api/wardrobe/analyze',
    body: AnalyzeWardrobeImageRequest,
    response: AnalyzeWardrobeImageResponse,
  }),

  listOutfits: route({ method: 'GET', path: '/api/outfits', response: z.array(OutfitSchema) }),
  createOutfit: route({ method: 'POST', path: '/api/outfits', body: CreateOutfitRequest, response: OutfitSchema }),
  getOutfit: route({ method: 'GET', path: '/api/outfits/:id', params: IdParams, response: OutfitSchema }),
  updateOutfit: route({
    method: 'PATCH',
    path: '/api/outfits/:id',
    params: IdParams,
    body: UpdateOutfitRequest,
    response: OutfitSchema,
  }),
  deleteOutfit: route({ method: 'DELETE', path: '/api/outfits/:id', params: IdParams, response: NoContent }),

  listGeneratedImages: route({
    method: 'GET',
    path: '/api/generated-images',
    response: z.array(GeneratedImageSchema),
  }),
  createGeneratedImage: route({
    method: 'POST',
    path: '/api/generated-images',
    body: CreateGeneratedImageRequest,
    response: GeneratedImageSchema,
  }),
  getGeneratedImage: route({
    method: 'GET',
    path: '/api/generated-images/:id',
    params: IdParams,
    response: GeneratedImageSchema,
  }),
  deleteGeneratedImage: route({
    method: 'DELETE',
    path: '/api/generated-images/:id',
    params: IdParams,
    response: NoContent,
  }),
} as const satisfies Record<string, RouteDef>;

export type RouteName = keyof typeof contract;
type InferOrNever<T> = T extends z.ZodType ? z.infer<T> : never;
export type RequestBodyOf<N extends RouteName> = InferOrNever<(typeof contract)[N]['body']>;
export type ResponseOf<N extends RouteName> = z.infer<(typeof contract)[N]['response']>;
```

Add to `index.ts`:

```ts
export * from './contract';
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test -w packages/shared && npm run typecheck -w packages/shared && npm run lint -w packages/shared && npm run format:check -w packages/shared
```

Expected: 14 tests pass. `contract.ts` is close to the 300-line limit once Prettier reformats it; if `max-lines` fails, move the request schemas into `packages/shared/src/requests.ts`, import them in `contract.ts`, and re-export both from `index.ts`. The test file imports must then come from `./requests` for the schemas and `./contract` for the table.

- [ ] **Step 5: Point the old API reference at the new contract**

Add at the top of `docs/references/api-contracts.md`, directly under the title:

```markdown
> **This document describes the current FastAPI backend, which is being replaced.** The contract for the new API lives in code at `packages/shared/src/contract.ts` and its entity schemas at `packages/shared/src/schemas.ts`. See `docs/decisions/cloudflare-architecture.md`. Until sub-project 2 ships, the web app still calls the endpoints below.
```

- [ ] **Step 6: Full gate, docs build, and commit**

```bash
npm run typecheck -w apps/web && npm run lint -w apps/web && npm run format:check -w apps/web && npm run test:coverage -w apps/web && npm run build -w apps/web
npm run typecheck -w packages/shared && npm run lint -w packages/shared && npm run format:check -w packages/shared && npm test -w packages/shared
cd docs && npm run build && cd ..
git add packages/shared docs/references/api-contracts.md
git commit -m "feat(shared): request schemas and the route table for the new API

Every client-facing route from the spec's API Surface, with params,
query, body, and response schemas. No consumer yet; sub-project 2
builds the Worker and the client from it."
```

---

## Self-review against the spec

- **Repository Layout:** `apps/web` and `packages/shared` created (Tasks 1, 2). `apps/api` and `apps/mobile` are sub-projects 2 and 3. `backend/` and `docs/` untouched. Covered.
- **Data Model:** every table in the spec has a schema (Task 3), with the job columns on avatars, wardrobe items, and generated images, camelCase names, keys with URLs alongside, `profiles` folded into `User`. `looks` and `wardrobe_templates` absent by design. Covered.
- **API Surface:** every route in the spec table except the webhook is in the route table (Task 4), with the presign body, the wardrobe filters, and the try-on body's either-or rule. Covered.
- **Error shape:** `ApiErrorSchema` with the four codes (Task 3). Covered.
- **Testing:** shared schemas have round-trip tests; CI runs them inside `Frontend checks` (Task 2). Covered.
- **Sub-project 1 description:** move, shared package, schemas, contract, no behavior change. Covered. The "Hono route types" wording is narrowed to a Hono-free route table, stated in Global Constraints.
- **Placeholders:** none. Every step has its code or command.
- **Type consistency:** `Category`, `Season`, `JobStatus` come from `enums.ts` in every task; `IdParams` and `NoContent` are defined in `contract.ts` before use; the test in Task 4 imports only names Task 4 exports.
