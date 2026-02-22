# Stage 1 — OpenNext Runtime Deploy (Cloudflare, DB Allowed Broken)

## Goal
Prove this Payload + Next app deploys and serves frontend routes on Cloudflare through OpenNext before SST, D1, or R2 changes.

## Prerequisites
- Baseline app builds and runs locally.
- Cloudflare account/project prerequisites available for test stage.
- No requirement to complete DB integration in this stage.

## Scope
- Runtime compatibility only.
- Validate route surface reachability with frontend-first success criteria:
  - `src/app/(frontend)/page.tsx`
  - `src/app/(payload)/admin/[[...segments]]/page.tsx`
  - `src/app/(payload)/api/[...slug]/route.ts`
  - `src/app/(payload)/api/graphql/route.ts`
  - `src/app/(payload)/api/graphql-playground/route.ts`

## Out of Scope
- Fixing database-backed login/auth/data behavior.
- D1 and R2 integration work.
- SST infrastructure adoption.

## Plan Gate Checklist
- [ ] Scope and out-of-scope boundaries are approved.
- [ ] Deploy command(s) and runtime target are documented.
- [ ] Smoke paths are listed with expected status per path (including expected DB failures).
- [ ] Image strategy decision path is defined.
- [ ] Open questions are documented.

## Tasks
1. Add a compatibility checklist for Next/Payload route handlers under OpenNext.
2. Deploy a minimal runtime test stage (without D1/R2 migration yet).
3. Validate the following smoke paths:
   - Frontend route renders successfully.
   - Admin/API/GraphQL routes are reachable and runtime status is recorded.
   - DB-related failures are logged as expected when present.
4. Identify image-processing compatibility for current `sharp` usage in `src/payload.config.ts`.
5. Decide runtime strategy for image ops (offload/defer/alternate path) and record decision.

## Implementation Gate Checklist
- [ ] Deployed Cloudflare URL for this stage is recorded.
- [ ] Frontend route success is verified.
- [ ] Runtime compatibility findings for admin/API/GraphQL are captured.
- [ ] Expected DB-related failures are tracked and deferred to Stage 3.
- [ ] Stage summary includes recommendation to proceed to Stage 2.

## Risks
- Native `sharp` compatibility in Cloudflare runtime paths.
- Generated Payload routes can mask runtime assumptions.
- GraphQL playground exposure policy in non-dev environments.

## Acceptance Criteria
- Frontend smoke tests pass on deployed runtime stage.
- Admin/API/GraphQL route runtime behavior is documented (pass or expected DB-linked failure).
- Runtime compatibility decision record exists for image processing.
- No blocking runtime errors remain for frontend route rendering.

## Pause Trigger
- Unresolved runtime incompatibility affecting frontend render.

## Deliverables
- Runtime compatibility matrix.
- Go/no-go decision for Stage 2.

## Open Questions
- Should GraphQL playground be disabled in staging/prod?
- Is any feature allowed to remain Node-only (if discovered), or must all be Cloudflare-compatible?