# Stage 4 — R2 Media Storage Integration

## Goal
Switch media object storage from local upload handling to Cloudflare R2 for Payload media assets.

## Prerequisites
- Stage 3 completed and stable on D1.
- R2 bucket provisioned for current stage.
- Storage URL policy agreed (public URL pattern / signed strategy).

## Scope
- Media collection storage behavior.
- Upload/read/delete validation.
- Cache and URL strategy.

## Out of Scope
- CI/CD automation.
- Non-media asset pipeline changes beyond required integration.

## Plan Gate Checklist
- [ ] Bucket naming, object key strategy, and URL policy are documented.
- [ ] Cache/header strategy is documented.
- [ ] Local development fallback behavior is defined.
- [ ] Validation checklist covers upload/read/delete + rendering.
- [ ] Open questions are captured.

## Tasks
1. Define object key naming convention:
   - include stage namespace
   - collision-safe naming
2. Implement Payload storage integration for `src/collections/Media.ts` and related config in `src/payload.config.ts`.
3. Define cache headers and delivery behavior for assets.
4. Validate media workflows:
   - upload from admin
   - retrieve/render in frontend
   - delete and confirm object cleanup
5. Define local development storage fallback strategy.

## Implementation Gate Checklist
- [ ] Payload media config points to R2 and is documented.
- [ ] Upload, read, and delete behavior passes end-to-end checks.
- [ ] Frontend/admin media rendering works with R2 URLs.
- [ ] Object lifecycle behavior (including delete cleanup) is verified.
- [ ] Stage completion recommendation is recorded.

## Risks
- URL/public access misconfiguration.
- Cache policy causing stale assets.
- Orphaned objects after document deletion.

## Acceptance Criteria
- Media upload/read/delete passes in deployed stage.
- Frontend/admin asset rendering works with R2-hosted files.
- Storage conventions documented and reproducible.

## Pause Trigger
- Broken media rendering in admin/frontend or inconsistent object lifecycle.

## Deliverables
- R2-backed media implementation.
- Storage naming/caching runbook.
- Verified end-to-end media test evidence.

## Open Questions
- Public bucket vs private + signed URL approach?
- Required asset retention policy for deletes?