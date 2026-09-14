# Deployment model

Seamless uses branch-based non-production deployments. Frontend hosting is being moved to Cloudflare Pages and the backend to Cloudflare Workers in the migration described in `decisions/cloudflare-architecture.md`; the table below is the state in between.

| Branch | Environment | Deployment |
| --- | --- | --- |
| `feature/**` | Preview | None until the Cloudflare migration adds per-branch preview Workers and Pages previews |
| `develop` | Staging | Backend staging on Render (`.github/workflows/deploy.yml`, after CI succeeds) |
| `main` | Production | Production deployment managed separately from this non-production workflow |

Every pull request to `main` or `develop` must pass the `Frontend checks`, `Backend checks`, and `Documentation build` jobs before it can be merged. See `decisions/merge-policy.md` for who merges where.

## Required GitHub configuration

Create the `staging` GitHub Environment with `RENDER_STAGING_DEPLOY_HOOK`. Configure required reviewers on `staging` so a staging deployment is approved before it runs. Keep production credentials in a separate `production` environment and do not reuse staging secrets.

The `main` and `develop` rulesets live in `.github/rulesets/` and are checked for drift by CI.
