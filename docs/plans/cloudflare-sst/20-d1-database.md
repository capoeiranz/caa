# Stage 3 — D1 Database Integration

## Goal
Move from current SQLite-local configuration to Cloudflare D1 as the runtime database for Payload.

## Prerequisites
- Stage 2 completed with SST runtime parity.
- D1 database created for target stage.
- Binding and env naming conventions agreed.

## Scope
- Payload database configuration updates.
- Environment contract updates.
- Greenfield initialization and verification.

## Out of Scope
- R2 media storage integration.
- CI/CD automation.

## Plan Gate Checklist
- [ ] D1 adapter approach and runtime compatibility assumptions are documented.
- [ ] Schema initialization workflow is defined for greenfield environments.
- [ ] Env/binding names are finalized for local deploy and Cloudflare runtime.
- [ ] Validation checklist covers auth/session + core CRUD.
- [ ] Open questions are captured.

## Tasks
1. Map current DB config in `src/payload.config.ts` to D1-compatible adapter strategy.
2. Introduce stage-aware DB binding/env mapping (dev/staging/prod).
3. Define greenfield schema initialization/bootstrap workflow.
4. Update docs and examples:
   - `.env.example`
   - `README.md`
5. Validate core DB behaviors:
   - auth login/session
   - users/media CRUD
   - Payload admin list/read/write
6. Run type safety and sanity checks:
   - `pnpm tsc --noEmit`

## Implementation Gate Checklist
- [ ] D1-backed configuration is applied and documented.
- [ ] Auth/session flow is verified against D1.
- [ ] Core CRUD flow is verified against D1.
- [ ] `pnpm tsc --noEmit` passes.
- [ ] Recommendation to proceed to Stage 4 is recorded.

## Risks
- Adapter/runtime mismatch between local dev and Cloudflare execution.
- Session/auth persistence edge cases.
- Divergent schema bootstrap across stages.

## Acceptance Criteria
- App uses D1 in deployed stage.
- Core auth + CRUD flows pass against D1.
- TypeScript check passes.
- DB setup steps are reproducible from docs.

## Pause Trigger
- Persistent auth/session failures or critical CRUD instability on D1.

## Deliverables
- Updated Payload DB configuration.
- D1 setup and bootstrap runbook.
- Verified stage test evidence.

## Open Questions
- Should local dev use remote D1, local D1 emulator, or configurable dual mode?