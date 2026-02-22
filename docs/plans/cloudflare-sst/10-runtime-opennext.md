# Stage 1 — OpenNext Runtime Deploy (Cloudflare, DB Allowed Broken)

## Lifecycle Status
`Planning Drafted` → `Planning Approved` → `Implementing` → `Validated` → `Complete`

Current state: **Implementing**

## Goal
Prove this Payload + Next app deploys and serves frontend routes on Cloudflare through OpenNext before SST, D1, or R2 changes.

## Plan Mode Output

### Scope Boundaries
In scope:
- Runtime compatibility and deployability through OpenNext on Cloudflare.
- Frontend-first route reachability checks.
- Recording expected DB-dependent failures without fixing them.
- Image/runtime compatibility decision for current Payload image handling.

Out of scope:
- Fixing database-backed login/auth/data behavior.
- D1 and R2 integration work.
- SST infrastructure adoption.
- CI/CD setup.

### Preconditions
- Baseline app builds and runs locally.
- Cloudflare account access and deploy target are available.
- Stage 1 remains the only active stage until marked `Complete`.
- Agreement that DB failures are acceptable in this stage if documented.

### Task List
1. Confirm OpenNext + Cloudflare compatibility assumptions for Next + Payload routes.
2. Define deploy commands and runtime target for a direct OpenNext deployment.
3. Execute deployment and record stage URL.
4. Run smoke checks and record result matrix for:
  - `src/app/(frontend)/page.tsx`
  - `src/app/(payload)/admin/[[...segments]]/page.tsx`
  - `src/app/(payload)/api/[...slug]/route.ts`
5. Capture DB-dependent failures as expected deferrals to Stage 3.
6. Resolve image processing runtime compatibility decision path for `sharp` usage in `src/payload.config.ts`.
7. Produce Stage 1 decision record with go/no-go recommendation for Stage 2.

### Risks and Open Questions
Risks:
- Native `sharp` compatibility in Cloudflare runtime paths.
- Generated Payload routes can mask runtime assumptions.
- SQLite runtime incompatibility in Workers currently causes Payload admin/API initialization failure.

Open questions:
- Is any feature allowed to remain Node-only (if discovered), or must all be Cloudflare-compatible?
- Should Stage 1 keep SQLite as an expected non-functional dependency for admin/API, or introduce a temporary Cloudflare-compatible DB adapter before Stage 3?

### Validation Checklist
Plan Gate checklist:
- [x] Scope and out-of-scope boundaries are approved.
- [x] Deploy command(s) and runtime target are documented.
- [x] Smoke paths are listed with expected status per path (including expected DB failures).
- [x] Image strategy decision path is defined.
- [x] Open questions are documented.

Implementation Gate checklist:
- [ ] Deployed Cloudflare URL for this stage is recorded.
- [ ] Frontend route success is verified.
- [x] Runtime compatibility findings for admin/API are captured.
- [x] Expected DB-related failures are tracked and deferred to Stage 3.
- [ ] Stage summary includes recommendation to proceed to Stage 2.

## Implementation Mode Output (In Progress)

### Applied Changes
- Ran `pnpm dlx @opennextjs/cloudflare@latest migrate` to scaffold direct OpenNext Cloudflare deployment support.
- Added OpenNext/Cloudflare runtime files: `open-next.config.ts`, `wrangler.jsonc`, `.dev.vars`, and `public/_headers`.
- Updated runtime scripts in `package.json`: `preview`, `deploy`, `upload`, and `cf-typegen`.
- Updated `next.config.mjs` with OpenNext Cloudflare dev initialization hook.
- Added direct dependency `libsql@0.4.7` so OpenNext bundle resolution succeeds.
- Adjusted Stage 1 runtime shape to avoid premature Stage 4 dependency:
  - Removed R2 incremental cache override from `open-next.config.ts`.
  - Removed `r2_buckets` binding from `wrangler.jsonc`.
- Fixed generated `wrangler.jsonc` compatibility date to a supported value (`2025-10-01`) for local preview.

### Validation Evidence
- OpenNext build now succeeds:
  - Command: `pnpm exec opennextjs-cloudflare build`
  - Result: `.open-next/worker.js` generated successfully.
- TypeScript validation passes:
  - Command: `pnpm exec tsc --noEmit`
  - Result: success (no type errors).
- Local Cloudflare preview runs successfully:
  - Command: `pnpm preview`
  - Result: Wrangler ready on `http://localhost:8787`.
- Route smoke matrix (local preview):
  - Frontend `/` → `200 OK` (renders correctly).
  - Admin `/admin` → `500` (Payload init fails due SQLite/libsql worker incompatibility).
  - API `/api/users/me` → `500` (same SQLite/libsql incompatibility path).
- Cloudflare deploy attempt (authenticated):
  - Command: `pnpm run deploy`
  - Result: deploy blocked by Cloudflare Worker size limit on current plan (`code: 10027`, limit `3 MiB`, produced worker exceeds limit).
  - Largest artifact reported by Wrangler: `.open-next/server-functions/default/handler.mjs` (~12.4 MiB).

### Residual Risks
- Payload with current SQLite adapter is not Cloudflare Worker-compatible for admin/API runtime paths.
- `sharp` runtime behavior in Cloudflare remains unresolved; image processing decision still required before Stage 1 closure.
- Cloudflare account plan limit prevents deployment of current OpenNext worker bundle size.

### Recommendation (Current)
- Do **not** mark Stage 1 complete yet.
- Current gate status: **no-go** for completion until deploy size blocker is resolved.
- Required next action (outside codebase):
  - Upgrade account to a Workers paid plan (supports up to 10 MiB), then rerun `pnpm run deploy`, **or**
  - change deployment target/architecture to one that supports current bundle size.
- After plan-limit resolution, rerun Stage 1 deploy and capture stage URL plus deployed smoke matrix.

## Acceptance Criteria
- Frontend smoke tests pass on deployed runtime stage.
- Admin/API route runtime behavior is documented (pass or expected DB-linked failure).
- Runtime compatibility decision record exists for image processing.
- No blocking runtime errors remain for frontend route rendering.

## Pause Trigger
- Unresolved runtime incompatibility affecting frontend render.

## Deliverables
- Runtime compatibility matrix.
- Stage 1 decision record.
- Go/no-go recommendation for Stage 2.