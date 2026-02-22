# Cloudflare + SST Migration: Overall Roadmap

## Objective
Deploy this Next.js + Payload project to Cloudflare in four sequential stages using OpenNext, SST, D1, and R2.

This is a new site and is not live yet:
- No downtime/cutover constraints are required in this plan.
- CI/CD setup is explicitly deferred.
- Deployments are run from local developer machines for now.

## Fixed Decisions
- Runtime strategy: OpenNext-managed Cloudflare compatibility.
- Data strategy: greenfield reset (no historical data migration).
- Planning location: `docs/plans/cloudflare-sst`.
- SST strategy: use latest stable SST and lock exact version during Stage 2.

## Stage Execution Protocol (Plan-of-Plans Contract)

Every stage must run through this lifecycle:

`Queued → Planning Drafted → Planning Approved → Implementing → Validated → Complete`

Execution rules:
- Only one stage may be active at a time.
- When asked to "implement next stage", the agent must begin with stage planning/refinement only.
- No code or infra changes may start until the stage is in `Planning Approved`.
- Unknowns found during implementation must be written back into that stage plan before continuing.
- Stage `N+1` is blocked until Stage `N` is `Complete`.

Required outputs per stage:
1. **Plan Mode Output**
  - Scope boundaries (in/out)
  - Preconditions
  - Task list
  - Risks and open questions
  - Validation checklist
2. **Implementation Mode Output**
  - Applied changes
  - Validation evidence
  - Residual risks
  - Recommendation to mark stage complete or not

## Stage Sequence
- Stage 1: OpenNext runtime deployment to Cloudflare (database may remain broken)
- Stage 2: Deploy same runtime shape using SST
- Stage 3: D1 database integration
- Stage 4: R2 media storage integration

## Master TODO List

### Stage 1 — OpenNext Runtime Deploy (DB allowed broken)
- [ ] Confirm OpenNext + Cloudflare target runtime constraints for Payload routes.
- [ ] Deploy via OpenNext directly (without SST).
- [ ] Validate frontend routes render in deployed environment.
- [ ] Record known DB-dependent failures as expected for this stage.
- [ ] Resolve image processing runtime compatibility (sharp replacement/strategy).
- [ ] Produce Stage 1 plan decision record and go/no-go gate.

### Stage 2 — SST Deploy of Same Runtime
- [ ] Add `sst.config.ts` in drop-in mode for current app.
- [ ] Deploy the same OpenNext runtime shape through SST.
- [ ] Define stage model for now as local-driven deploy target (`dev` first).
- [ ] Define secret/env contract required for runtime parity.
- [ ] Document local deploy workflow (`sst dev`, `sst deploy --stage ...`).

### Stage 3 — D1 Database Integration
- [ ] Replace current local SQLite setup with D1-backed configuration strategy.
- [ ] Define schema initialization workflow for greenfield environments.
- [ ] Document environment variables and binding names.
- [ ] Verify auth/session flows and CRUD operations against D1.
- [ ] Pass TypeScript validation (`tsc --noEmit`).

### Stage 4 — R2 Media Storage Integration
- [ ] Define R2 bucket structure, naming, and cache policy.
- [ ] Configure Payload media collection for R2 object storage.
- [ ] Validate upload, read, and delete operations end-to-end.
- [ ] Define local development fallback for media handling.
- [ ] Verify URL delivery behavior in frontend/admin.

## Stage Gates
| Stage | Entry Criteria | Exit Criteria | Pause Trigger |
|---|---|---|---|
| 1 | App runs locally | OpenNext deploy succeeds and frontend routes respond; DB failures may remain | Unresolved runtime blocker for frontend route rendering |
| 2 | Stage 1 complete | SST deploy succeeds with same runtime behavior as Stage 1 | Runtime parity regressions or SST binding failure |
| 3 | Stage 2 complete | D1 CRUD/auth pass + `tsc --noEmit` pass | Auth/session instability or core CRUD failure |
| 4 | Stage 3 complete | R2 upload/read/delete pass and media URL delivery verified | Media inaccessibility, corruption, or lifecycle inconsistency |

## Security & Quality Guardrails
- Maintain Payload security patterns from `AGENTS.md`:
  - If Local API is called with `user`, set `overrideAccess: false`.
  - Pass `req` to nested operations in hooks.
  - Avoid hook recursion loops via context flags.
- After schema/config changes, regenerate relevant Payload artifacts when needed.
- Run `tsc --noEmit` before marking implementation complete.

## Working Conventions
- Each stage file is source-of-truth for implementation tasks.
- Any new unknown is logged under stage “Open Questions”.
- Stage cannot be marked complete unless its acceptance criteria are met.
- Stage documents must include both a Plan Gate checklist and an Implementation Gate checklist.