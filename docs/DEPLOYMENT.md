# Deployment model

Seamless uses branch-based non-production deployments:

| Branch | Environment | Deployment |
| --- | --- | --- |
| `feature/**` | Preview | Frontend preview on Vercel |
| `develop` | Staging | Frontend preview on Vercel and backend staging on Render |
| `main` | Production | Production deployment managed separately from this non-production workflow |

Every pull request to `main` or `develop` must pass the `Frontend checks`, `Backend checks`, and `Documentation build` jobs before it can be merged.

## Required GitHub configuration

Create these GitHub Environments:

- `preview`: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`
- `staging`: the same Vercel secrets plus `RENDER_STAGING_DEPLOY_HOOK`

Configure required reviewers on `staging` so a staging deployment is approved before it runs. Keep production credentials in a separate `production` environment and do not reuse staging secrets.

The `main` and `develop` branches should be protected with pull requests required, one approval required, stale approvals dismissed after new commits, conversations resolved, and the three CI jobs above required.
