# Stage 2 — SST Deploy of Existing OpenNext Runtime

## Goal
Deploy the same runtime shape from Stage 1 using SST in drop-in mode, without introducing D1 or R2 changes yet.

## Prerequisites
- Stage 1 completed with successful OpenNext frontend deployment.
- Cloudflare account scopes and project naming confirmed.

## Scope
- Introduce SST config in drop-in mode.
- Re-deploy runtime parity from Stage 1 through SST.
- Document local developer deploy workflow.

## Out of Scope
- D1 database integration.
- R2 media integration.
- CI/CD pipeline automation.

## Plan Gate Checklist
- [ ] Runtime parity target with Stage 1 is explicitly defined.
- [ ] SST version pinning and install/update approach are documented.
- [ ] Required bindings/secrets for Stage 2 are listed.
- [ ] Deploy commands and verification checks are documented.
- [ ] Open questions are captured.

## Tasks
1. Add `sst.config.ts` at repository root in drop-in mode.
2. Define initial stage target for local deployment (`dev`).
3. Provision and bind only resources needed to reproduce Stage 1 runtime.
4. Define secret handling and env contract:
   - `PAYLOAD_SECRET`
   - runtime binding names used in Stage 2
5. Add deployment workflow docs:
   - `sst dev`
   - `sst deploy --stage <stage>`
6. Verify deployment parity with Stage 1 expectations.

## Implementation Gate Checklist
- [ ] `sst.config.ts` exists and is reviewed.
- [ ] Stage 2 deploy command succeeds from local machine.
- [ ] Frontend behavior matches Stage 1 expectations.
- [ ] Differences from Stage 1 (if any) are documented.
- [ ] Recommendation to proceed to Stage 3 is recorded.

## Risks
- Incorrect binding names causing runtime failures.
- Runtime drift from Stage 1 behavior.
- Local secret/env mismatch.

## Acceptance Criteria
- `dev` stage deploy succeeds through SST.
- Frontend runtime behavior matches Stage 1 baseline.
- Docs provide repeatable local setup/deploy process.

## Pause Trigger
- Reproducible deploy failures or runtime parity regression versus Stage 1.

## Deliverables
- `sst.config.ts` and infra wiring.
- Stage 2 env contract documentation.
- Successful local SST deploy evidence.

## Open Questions
- Do we keep only `dev` in this phase and defer `staging`/`prod` until after Stage 4?