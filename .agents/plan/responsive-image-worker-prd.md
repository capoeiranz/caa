# Responsive Media Route

Status: ready-for-agent

## Problem Statement

The site needs a production-ready image delivery pipeline that improves page performance without
turning the application into a general-purpose image editing platform. The current app now serves
responsive imagery through a TanStack Start route at `/media`, but the contract and implementation
still reflect earlier worker-oriented thinking, broader transform scope, and unresolved bugs in the
PNG to WebP path.

From the user perspective, the site should render responsive images through the site-owned wrapper,
deliver WebP explicitly where requested, preserve alpha where possible, preserve aspect ratio by
default, and keep the API small and cache-shaped.

## Solution

Use the existing TanStack Start route at `/media` as the image delivery boundary. Keep the route
path-based, with the source image encoded in the path and only transform controls in the query
string. The wrapper remains site-owned and continues to render explicit WebP-first markup, but it
must be simplified to match the narrowed route contract.

The route stays intentionally small. It validates the request, rejects non-canonical or recursive
source paths, fetches the site-owned source asset, passes through whenever no real transform is
needed, resizes by width when required, encodes only when necessary, and returns a small diagnostic
header surface. The wrapper owns responsive widths and explicit WebP source generation, but no
longer drives height or crop behavior.

## User Stories

1. As a site visitor, I want large images to load in responsive sizes, so that pages render faster
   on mobile and desktop.
2. As a site visitor, I want browser-supported modern formats to be preferred, so that I download
   less image data when possible.
3. As a site visitor, I want transparent images to stay transparent, so that logos and graphic
   assets do not render incorrectly.
4. As a site visitor, I want still images to retain their intended aspect ratio by default, so that
   ordinary content images are not unexpectedly cropped or distorted.
5. As a developer, I want `/media` to stay small and cache-shaped, so that the public API remains
   easy to reason about.
6. As a developer, I want `/media` to support only `GET` and `HEAD`, so that the route stays
   request-shaped rather than becoming a general API.
7. As a developer, I want the route contract to be exact, so that unknown params and alternate
   request shapes do not fragment cache behavior.
8. As a developer, I want passthrough wherever no real transform is needed, so that the route avoids
   wasted work.
9. As a developer, I want no upscaling, so that responsive delivery never invents pixels.
10. As a developer, I want explicit format URLs rather than Accept-driven negotiation, so that cache
    behavior stays deterministic on Cloudflare.
11. As a developer, I want the wrapper to remain site-owned, so that responsive widths and explicit
    WebP-first markup stay centralized.
12. As a developer, I want the wrapper to align with the width-only `/media` API, so that route and
    wrapper behavior stop drifting apart.
13. As a developer, I want source fetch failures, invalid requests, and transform failures to remain
    distinguishable, so that debugging the image path stays tractable.
14. As a developer, I want the PNG to WebP alpha bug fixed as a hard requirement, so that the
    feature is viable without changing direction.

## Implementation Decisions

- Keep the image delivery boundary at the existing TanStack Start route `/media`.
- Keep `/media` path-based. The source image path lives in the route path, not in a `src` query
  parameter.
- Keep site-owned image paths only. Do not support absolute URLs or source query-string identity.
- Keep explicit format URLs. Do not use Accept-driven format negotiation.
- Keep the wrapper WebP-first: emit explicit WebP sources and preserve the original encoded format
  when `fmt` is omitted.
- Narrow the public transform contract to width-only transforms.
- Remove public `h`, `fit`, and `q` from the `/media` contract.
- Narrow public `fmt` to `webp` only. Omitted `fmt` means preserve the source encoded format.
- Keep `w` mandatory for any non-passthrough transform.
- Keep `GET /media/<path>` without `w` as stable passthrough behavior.
- Reject any unknown, duplicate, empty, or out-of-order query params.
- The only valid query shapes are no query string or `?w=<positive-int>` and
  `?w=<positive-int>&fmt=webp`.
- Reject non-canonical source paths, including duplicate slashes, dot-segments, encoded alternate
  path shapes, and circular `/media` targets.
- Support only `GET` and `HEAD` as explicit route handlers. Do not add extra method behavior now.
- For `HEAD`, return no body on any success or failure path.
- Preserve aspect ratio by default. Height is always derived from the source image.
- Remove the explicit derived-height cap from the public route behavior.
- Keep no-upscale semantics. Requested width is a maximum target width, not an instruction to
  enlarge.
- Perform same-dimension format conversion when `fmt=webp` is requested for a non-WebP source.
- Passthrough whenever no real transform is required, including same-format native-size requests.
- If the source is already WebP and no downscale is needed, `fmt=webp` should passthrough.
- Keep the current caching behavior for now. Caching changes are out of scope.
- Keep passthrough format-agnostic when no transform is requested.
- For JPEG downscales, use a fixed internal quality of `75` with no public override.
- Keep source fetch failures distinct from transform failures.
- Propagate source statuses like `404` and `403` instead of collapsing them to `500`.
- Return `400` for invalid requests and unsupported transform inputs.
- Return `500` for actual transform pipeline failures.
- Rename diagnostic headers from `x-image-worker-*` to `x-media-*`.
- Keep the diagnostic header surface small. Success responses expose `x-media-mode` universally and
  expose actual delivered format and width only when meaningful.
- Error responses also expose `x-media-mode`, using failure-oriented modes rather than widening the
  error body contract.
- Diagnostic width values report actual delivered width, not merely requested width.
- The wrapper must stop emitting `h` and `fit` in `/media` URLs immediately.
- The wrapper may continue accepting `height` as a layout prop only.
- Fix PNG to WebP alpha preservation as a hard requirement of the current implementation path.

### Deep Modules

- Media route request policy module: owns exact query validation, source-path canonicality checks,
  recursion rejection, and error shaping.
- Media route transform pipeline module: owns source fetch, passthrough decisions, no-upscale
  behavior, resize, encode, and response assembly.
- Site image wrapper module: owns Unpic integration, responsive widths, explicit WebP sources, and
  alignment with the width-only `/media` API.
- Photon adapter module: owns the narrow integration with `@cf-wasm/photon/workerd`, including the
  PNG to WebP alpha-fix path if the bug is local to the current implementation.

## Testing Decisions

- Good tests should verify external behavior rather than implementation details.
- Pure logic should be tested at the unit layer when it has branching, normalization, or policy
  decisions.
- Framework wiring, React rendering internals, and trivial re-exports should not receive direct unit
  coverage if typechecking already protects them.
- User-visible behavior that crosses routing, rendering, image markup, and delivered image content
  should be tested at the browser layer.
- The highest-value unit coverage is the strict request parser and path/query validation logic.
- The highest-value browser-level acceptance test is the PNG to WebP alpha-preservation case through
  the public `/media` contract.
- The alpha-preservation acceptance test should use a purpose-built transparent PNG fixture and
  assert decoded alpha values in the browser, not just visual inspection.
- The acceptance surface for the alpha bug includes both same-size PNG to WebP conversion and a real
  downscale case.
- Error handling for invalid requests, source failures, and transform failures should be tested
  through the public `/media` contract rather than private helpers.
- Prior art in the repo is currently lightweight Playwright smoke coverage for successful homepage
  loading and 404 handling, plus the documented testing strategy that prefers pure-logic unit tests
  and Playwright for user-visible behavior.
- New tests should follow the repo’s stated rule to test only external behavior, keep pure logic
  isolated, and prefer targeted Playwright coverage over broad end-to-end expansion.

## Out of Scope

- Any separate image worker or subdomain architecture.
- Height-driven transforms, crop behavior, or fit controls.
- Public quality controls.
- Public non-WebP explicit format controls.
- Accept-header-driven cache negotiation.
- Absolute URL sources.
- Source query-string identity.
- Caching changes.
- A broader media-management or bucket-backed content system.
- Contingency planning for alternative backends unless the current implementation proves unable to
  satisfy the hard alpha-preservation requirement.

## Further Notes

- The stable boundary is the `/media` route contract, not a specific historical implementation.
- The wrapper is subordinate to the `/media` contract and must be simplified to match it.
- The route should remain narrow enough that responsive delivery does not turn into a general image
  editing API.
- The PNG to WebP alpha bug is a hard dependency of the feature and must be fixed, not worked around
  preemptively.
