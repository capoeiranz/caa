# Stage 1 — OpenNext Runtime Deploy (Cloudflare, DB Allowed Broken)

## Lifecycle Status
`Planning Drafted` → `Planning Approved` → `Implementing` → `Validated` → `Complete`

Current state: **Planning Drafted**

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

Open questions:
- Is any feature allowed to remain Node-only (if discovered), or must all be Cloudflare-compatible?

### Validation Checklist
Plan Gate checklist:
- [ ] Scope and out-of-scope boundaries are approved.
- [ ] Deploy command(s) and runtime target are documented.
- [ ] Smoke paths are listed with expected status per path (including expected DB failures).
- [ ] Image strategy decision path is defined.
- [ ] Open questions are documented.

Implementation Gate checklist:
- [ ] Deployed Cloudflare URL for this stage is recorded.
- [ ] Frontend route success is verified.
- [ ] Runtime compatibility findings for admin/API are captured.
- [ ] Expected DB-related failures are tracked and deferred to Stage 3.
- [ ] Stage summary includes recommendation to proceed to Stage 2.

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