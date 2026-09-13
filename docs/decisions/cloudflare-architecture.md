# Cloudflare Architecture and Mobile Direction

**Version**: 1.0
**Status**: Approved design, pending implementation
**Last Updated**: 2026-09-12

This document is the design spec for moving Seamless off Render and Supabase onto Cloudflare, and for adding a mobile app that shares one API with the web app. It supersedes the hosting and auth choices in `technology-selection.md` and the client-side image processing plan in `image-processing.md`.

---

## Problem Statement

Seamless is being extended from a desktop web app to a mobile app. Before building a second client, the architecture has to be one that both clients can share without a later rewrite. The current architecture has four problems that block that.

1. **The backend does not verify identity.** The frontend sends a Supabase JWT, but no backend route reads it. Every route trusts the `user_id` in the request body or query string and runs with the service-role key, which bypasses row-level security. Any caller can read, generate against, or delete any user's data. The storage policies have the same gap: any signed-in user can write to or delete any object, and the buckets are public.
2. **Two data paths.** The web frontend writes outfits, avatars, and profiles directly to Supabase and everything else through the backend. A mobile client would have to replicate both. The project's own core belief that the backend is the source of truth is not true in the code.
3. **Slow, blocking generation.** The three fal.ai calls and the Pillow thumbnail compositor run synchronously inside HTTP requests on a free Render instance. Avatar and try-on generation hold the request open for 10 to 30 seconds on top of cold starts. On a phone that is a dropped connection.
4. **Platform limits and cost shape.** Render's free tier sleeps, and Supabase's free tier caps database size, storage, and egress at levels the image-heavy product will hit early. Cloudflare's free and five-dollar tiers cover the same needs with no egress charges.

The backend is about 1,800 lines of Python across 19 routes. It is small enough to port rather than migrate.

---

## Decision

Rebuild the backend as a single TypeScript Worker on Cloudflare, with D1 for data, R2 for media, and Better Auth for identity. Restructure the repository into a monorepo so a React web app and an Expo mobile app share one typed API contract. Turn off Render, Supabase, Vercel, and GitHub Pages when the port is complete.

### Decisions recorded

| Area | Decision | Alternatives rejected |
|---|---|---|
| Mobile client | React Native with Expo | Native Swift and Kotlin (two codebases, nothing shared); PWA or Capacitor (weak camera and photo access, desktop-only UI) |
| Web client | Keep, share packages with mobile | Replace with mobile (loses the outfit builder); keep separate (two clients drift) |
| API runtime | Cloudflare Workers, TypeScript, Hono | Python Workers (beta, cold starts, no Pillow or fal SDK); keep FastAPI on Fly.io (two languages, no free tier) |
| Plan | Workers Paid from the first deploy, about $5 a month | Free tier (10ms CPU per request rules out password hashing) |
| Database | D1 with Drizzle ORM | Keep Supabase Postgres via Hyperdrive (keeps the vendor being left); Neon (another vendor) |
| Media | One private R2 bucket, presigned URLs | Public buckets (exposes user body photos); serving through the Worker (spends request quota on image loads) |
| Auth | Better Auth inside the Worker, users and sessions in D1 | Clerk (10k MAU cap then paid, another vendor); keep Supabase Auth (identity is the hardest thing to migrate later) |
| Sign-in methods | Email and password, Google, Sign in with Apple | Social and email code only (user requires passwords) |
| Transactional email | Resend | None available on Cloudflare; it only receives mail |
| Long jobs | fal.ai queue with webhook, client polls a status column | Cloudflare Queues (paid, unnecessary); Workflows (unnecessary until webhooks prove unreliable); synchronous requests (unusable on mobile) |
| Thumbnails | Rendered by the client from the on-screen outfit, uploaded like any image | Pillow on the server (CPU-heavy, deleted); Cloudflare Images overlays (paid, unnecessary) |
| Web hosting | Cloudflare Pages for the web app and the docs site | Vercel and GitHub Pages (two more vendors) |
| Monorepo tooling | npm workspaces | Turborepo and pnpm (add when builds get slow) |
| Existing users | Fresh start; only test accounts exist | Export and import (unnecessary) |

---

## Rationale

### Why Workers, and why the paid plan

Workers have no instance count. Every request runs on the nearest edge machine, and both plans scale the same way. The plans differ only in quotas. The free plan allows 100k requests a day and 10ms of CPU per request. Waiting on a fetch to fal.ai costs no CPU, so the AI calls fit the free plan. Password hashing does not: scrypt takes on the order of 100ms. The paid plan lifts the per-request CPU limit to 30 seconds and includes 10 million requests and 30 million CPU-milliseconds a month for five dollars.

Cost at scale, from the pricing pages on 2026-09-12:

| Product | Free | Paid, after the $5 base |
|---|---|---|
| Workers | 100k requests a day, 10ms CPU | 10M requests and 30M CPU-ms included, then $0.30 per million requests and $0.02 per million CPU-ms |
| D1 | 5M row reads a day, 100k writes a day, 5GB | 25B reads and 50M writes a month included, 5GB then $0.75 per GB |
| R2 | 10GB, 1M writes, 10M reads a month | $0.015 per GB, $4.50 per million writes, $0.36 per million reads, egress free |
| Pages | Unlimited bandwidth | Same |

At 1,000 daily active users making 50 requests each, the API uses 1.5M of the 10M included requests. A thousand users with 50 photos each at 2MB is 100GB in R2, about $1.50 a month. The bill that grows with users is fal.ai, at a few cents per generated image. Cloudflare stays under $10 a month until the tens of thousands of users.

### Why one API and no direct data access from clients

Every query in the new API is scoped by the user id from the session, never from the request. That closes the identity hole by construction: there is no code path where a client-supplied user id reaches a query. It also gives the mobile app one thing to integrate with, and gives the web app the same, which removes the second data path.

### Why jobs are asynchronous

A mobile client cannot hold a request open for 30 seconds. fal.ai already provides a queue with webhooks, so the Worker needs no queue of its own. The existing `model_status` column on avatars is already the right shape; the design extends it to the other two generation types.

---

## System Shape

One Worker, two thin clients, everything on Cloudflare.

- **API**: a single Worker running Hono. It owns all data access. Better Auth runs inside the same Worker. Every route except the auth routes and the fal.ai webhook requires a session.
- **Data**: one D1 database. Five live tables carry over; `looks` and `wardrobe_templates`, which nothing references, are dropped.
- **Media**: one private R2 bucket with `avatars/`, `wardrobe/`, and `generated/` prefixes, each prefix further namespaced by user id. Clients get short-lived presigned URLs for upload and download. Image bytes never pass through the Worker.
- **Jobs**: fal.ai queue plus webhook, status column, client polling. Details below.
- **Hosting**: API on Workers, web app and docs on Pages, deployed from GitHub Actions.

---

## Data Model

D1 with Drizzle. Identifiers are UUIDs generated by the Worker. Timestamps are integer milliseconds. Postgres arrays become JSON columns. Columns store R2 object keys, never URLs; the API attaches presigned URLs when it returns a row.

**Better Auth tables** `user`, `session`, `account`, `verification`. The library owns their shape. Two additional fields are declared on `user`: `onboarding_completed` and `tutorial_completed`, both boolean, default false. Today's `profiles` table folds into `user`; the `display_name` column becomes Better Auth's `name`.

**`avatars`**: `id`, `user_id`, `original_key`, `model_key` nullable, `status` in pending, processing, ready, failed, `fal_request_id` nullable, `error` nullable, `is_active` default true, `created_at`, `updated_at`.

**`wardrobe_items`**: `id`, `user_id`, `name`, `category` in tops, bottoms, dresses, shoes, accessories, outerwear, `image_key`, `status` in processing, ready, failed, `fal_request_id` nullable, `error` nullable, `labels` JSON array of strings, `colors` JSON array, `seasons` JSON array, `is_inspiration` default false, `created_at`, `updated_at`. `is_template` is dropped with the templates table. The status columns exist because background removal is a job: the item is created immediately with the original image and becomes ready when the processed image replaces it.

**`outfits`**: `id`, `user_id`, `name` nullable, `item_ids` JSON array of ids, `thumbnail_key` nullable, `created_at`, `updated_at`.

**`generated_images`**: `id`, `user_id`, `outfit_id` nullable, `image_key` nullable, `prompt`, `status` in processing, ready, failed, `fal_request_id` nullable, `error` nullable, `created_at`.

Indexes on `user_id` for every table, plus `(user_id, category)` on wardrobe items.

Migrations are generated by drizzle-kit from the schema file and applied by the deploy workflow with wrangler, so no SQL is run by hand against production.

---

## Auth Flow

Better Auth is mounted at `/api/auth/*` inside the Worker, with the Drizzle adapter on D1.

- **Methods**: email and password with email verification; Google; Sign in with Apple. Apple is required by App Store rules once Google is offered. Google needs OAuth client ids for web, iOS, and Android. Apple needs the Apple Developer account that the store submission needs anyway.
- **Email**: verification and password reset go through Resend. The sender is behind one small interface so it can be swapped.
- **Sessions**: a cookie for the web app, a bearer token for mobile. Better Auth's Expo client keeps the token in the device secure store and attaches it. A Hono middleware resolves the session on every request and places the user on the request context. Every route except auth and the webhook requires it.
- **Ownership**: every query filters on the session's user id. A row that exists but belongs to someone else returns 404, so ids leak nothing.
- **Rate limiting**: Better Auth's built-in limiter, backed by a KV namespace, on the auth routes.
- **Clients**: the React and Expo client packages from Better Auth, so sign-in code has the same shape on web and mobile.

---

## API Surface

Hono routes under `/api`. All require a session unless noted.

| Route | Purpose |
|---|---|
| `auth/*` | Better Auth. No session required. |
| `GET me`, `PATCH me` | Current user and the onboarding and tutorial flags. |
| `POST uploads/presign` | Body: kind (avatar, wardrobe, generated), content type. Returns an R2 key under the caller's prefix and a PUT URL valid for 15 minutes. The client uploads directly, then creates the row that references the key. Any key outside the caller's prefix is rejected. |
| `GET avatars`, `POST avatars`, `GET avatars/:id`, `DELETE avatars/:id` | Create takes an uploaded original key. Delete removes the row and both objects. |
| `POST avatars/:id/generate` | Starts the model canvas job. |
| `GET wardrobe/items`, `POST wardrobe/items`, `GET wardrobe/items/:id`, `PATCH wardrobe/items/:id`, `DELETE wardrobe/items/:id` | List accepts category, search, colors, seasons filters. Create takes an uploaded key and starts the background removal job. |
| `POST wardrobe/analyze` | Body: an uploaded key. Returns suggested name, category, colors, seasons, and labels from Gemini. Synchronous; takes a few seconds and the form is waiting. |
| `GET outfits`, `POST outfits`, `GET outfits/:id`, `PATCH outfits/:id`, `DELETE outfits/:id` | Thumbnail key is supplied by the client after it renders and uploads the thumbnail. |
| `GET generated-images`, `POST generated-images`, `GET generated-images/:id`, `DELETE generated-images/:id` | Create takes an outfit id or a list of item ids and starts the try-on job. |
| `POST webhooks/fal` | fal.ai completion callback. Verified, not session-authenticated. |

Every row that references media is returned with a presigned GET URL valid for one hour next to each key.

Error shape for every non-2xx response: a JSON object with `error.code` and `error.message`. Validation failures are 400 from Zod. Missing session is 401. Not found or not owned is 404. Upstream fal.ai, Gemini, or Resend failures are 502.

---

## Job Pipeline

Used by avatar generation, try-on generation, and background removal.

1. The route creates or updates the row with `status` processing, submits to the fal.ai queue with the webhook URL and a per-job secret, stores `fal_request_id`, and returns the row.
2. fal.ai calls `POST /api/webhooks/fal` on completion. The Worker verifies the request against the stored secret and request id, downloads the result image, writes it to R2 under the row's prefix, and sets the row to ready with the new key, or to failed with the error text. A repeated webhook for a row that is already ready or failed is ignored.
3. Clients poll the row every three seconds while it is processing. If a row has been processing for more than two minutes when polled, the API asks fal.ai for the request status directly and finalizes the row the same way the webhook would. This is the fallback for a lost webhook and costs nothing while webhooks work.
4. A failed row keeps its error text so the client can offer a retry, which starts a new job on the same row.

fal.ai models are unchanged: `fal-ai/nano-banana-2/edit` for avatar and try-on, `fal-ai/birefnet/v2` for background removal. Gemini `gemini-3-flash-preview` for analysis, called synchronously.

---

## Repository Layout

npm workspaces at the repo root.

```
apps/api        Hono Worker: routes, Drizzle schema and migrations, Better Auth config, wrangler config
apps/web        The React app, moved from frontend/
apps/mobile     Expo app
packages/shared Zod schemas, enums, and the typed API client derived from the Hono route types
docs/           Unchanged
backend/        Deleted at the end of sub-project 2
```

The shared package is the contract. Both clients import request and response types from it, and the Worker validates against the same schemas. Stores stay per app; only schemas and the client are shared.

---

## Testing

- **API**: vitest running inside the Workers runtime with local D1 and R2 bindings. fal.ai, Gemini, and Resend are mocked at the fetch layer. Every route has a test for the happy path, the validation failure, and the not-owned case. The webhook has tests for completion, failure, replay, and the poll fallback.
- **Shared**: round-trip tests for every schema.
- **Web**: existing vitest suite, updated to the new client.
- **Mobile**: vitest for stores, React Native Testing Library for screens, the iOS simulator for smoke checks.
- **Browser**: Playwright, Chromium only, in `apps/web/e2e/`. One smoke test at first: sign in, dashboard, wardrobe, outfit builder, start a generation, see the result. It runs against a preview Worker with the real API and real staging data, with only fal.ai stubbed by the environment flag. This is the acceptance run for every feature. It is built in sub-project 2, once there is a preview Worker to run against; before that the rule would be unrunnable.
- **Acceptance rule**: once the browser suite exists, stage 0 of the feature pipeline gains one line. A feature spec is not approved until it names the browser test that proves it, and that test exists and passes against a preview before the PR merges.
- **CI**: an API job joins the existing frontend, backend, and docs jobs, and a browser job follows in sub-project 2. The backend job is removed with `backend/`. Coverage floors carry over and ratchet up.

---

## Environments and Deployment

Two data tiers, many deployments. Production has its own D1 database and R2 bucket. Staging has its own. Every preview deployment binds to the staging data, so all development branches share one database, the same trade-off Vercel previews make.

| Environment | Trigger | API | Web and docs | Data | fal.ai |
|---|---|---|---|---|---|
| Preview | push to `feature/**` or `fix/**`, after CI is green | One Worker per branch, named from the branch slug | Pages preview deployment, automatic per branch | Staging D1 and R2 | Stubbed by default |
| Staging | push to `develop`, after CI is green | `api-staging` Worker | Pages branch deployment | Staging D1 and R2 | Real |
| Production | merge to `main` | `api` Worker | Pages production | Production D1 and R2 | Real |

- **Preview lifecycle**: a workflow on the branch-delete event runs `wrangler delete` for that branch's Worker, so previews do not accumulate.
- **Migrations**: the deploy job applies pending migrations before deploying, for every environment including previews. Because previews share the staging database, migrations must be additive: add columns and tables, never drop or rename in the same change that stops using them. Destructive changes wait until no deployed branch references the column. Review enforces this rule.
- **fal.ai stub**: a Worker environment flag. When set, the fal.ai client returns a fixed image after a short delay instead of calling out, and the webhook path runs for real. Previews set it by default so CI runs and demos do not spend generation credits. Any preview can be redeployed with it off.
- **Webhooks**: the fal.ai webhook URL is derived from the Worker's own hostname, so a job completes against whichever deployment started it.
- **Mobile**: the app reads its API host from an environment value at build time, so a development build can target any of the three.
- **Secrets**: `FAL_KEY`, `GOOGLE_API_KEY`, `RESEND_API_KEY`, `BETTER_AUTH_SECRET`, and the OAuth client secrets are set per environment with `wrangler secret` and live only in Cloudflare. Previews use the staging secrets. The repo holds one GitHub secret, `CLOUDFLARE_API_TOKEN`.
- **Local**: `wrangler dev` with local D1 and R2, and Expo pointed at it over the local network.

---

## Sub-projects

Each gets its own implementation plan and goes through the feature pipeline.

1. **Monorepo and shared contract.** Move `frontend/` to `apps/web`, create `packages/shared`, extract the Zod schemas, define the API contract as Hono route types with no implementation. No behavior change. Everything after depends on it.
2. **API on Cloudflare.** Build `apps/api`, port the 19 routes, implement auth, uploads, and the job pipeline with the fal.ai stub flag, set up the three environments including per-branch preview Workers and their cleanup, add the Playwright smoke test and the stage 0 acceptance rule, switch the web app to the new client, delete `backend/`, turn off Render, Supabase, and Vercel.
3. **Mobile app.** Build `apps/mobile` on the shared contract: sign-in, avatar onboarding, wardrobe, outfit builder, looks.

Style analysis and the other unbuilt features from the original product brief follow as ordinary features.

---

## Out of Scope

- Migrating existing users or data. Only test accounts exist.
- Cloudflare Queues, Workflows, Durable Objects, and Cloudflare Images. None are needed at this scale; the design does not depend on their absence.
- Offline support in the mobile app.
- The `looks` and `wardrobe_templates` tables and any feature built on them.
