# Responsive Image Worker

Status: ready-for-agent

## Problem Statement

The site needs a production-ready image delivery pipeline that improves page performance without
turning the application into a general-purpose image editing platform. The current app serves Vite
assets directly and only has a proof-of-concept production cache purge. There is no dedicated image
subdomain, no reusable image wrapper, no consistent responsive image contract, and no path for
future main-domain media originals backed by bucket storage.

From the user perspective, the site should be able to render responsive images through Unpic,
deliver browser-appropriate formats, preserve existing immutable Vite asset behavior, and later
extend to main-domain media originals without rewriting all image call sites.

## Solution

Build a second Cloudflare Worker in the same SST app that serves optimized images from a dedicated
image subdomain in production and generated Worker URLs in non-production. The app will keep using
canonical source URLs from the main site origin, while a local site-owned image wrapper will use
Unpic to generate responsive image markup and explicit format URLs targeting the image worker.

The worker will stay intentionally small. It will validate the request, canonicalize the source URL,
enforce environment-specific origin allowlisting, fetch the source image from the current app
origin, reject unsupported or oversized inputs, resize using the Cloudflare Worker entrypoint of the
`@cf-wasm/photon` package, encode only the requested format, apply long-lived cache headers, and
return diagnostic headers. The wrapper will own breakpoints, format negotiation, unsupported-format
bypass rules, and canonicalization of same-origin asset paths.

## User Stories

1. As a site visitor, I want large images to load in responsive sizes, so that pages render faster
   on mobile and desktop.
2. As a site visitor, I want browser-supported modern formats to be preferred, so that I download
   less image data when possible.
3. As a site visitor, I want transparent images to stay transparent, so that logos and graphic
   assets do not render incorrectly.
4. As a site visitor, I want still images to retain their intended aspect ratio by default, so that
   ordinary content images are not unexpectedly cropped.
5. As a site visitor, I want hero and splash images to support deliberate cover crops, so that fixed
   visual layouts can use responsive imagery cleanly.
6. As a site editor, I want image URLs used in app code to stay tied to the main site origin, so
   that delivery mechanics can change without rewriting content references.
7. As a site editor, I want future media originals to fit the same contract as current Vite assets,
   so that the app has one consistent image story.
8. As a developer, I want a dedicated image worker on its own subdomain, so that cache policy and
   failures stay isolated from the main app worker.
9. As a developer, I want the image worker managed in the same SST app, so that infrastructure
   changes stay within one deployment boundary.
10. As a developer, I want non-production environments to use generated Worker URLs, so that DNS
    setup stays simple while preserving the same architectural shape.
11. As a developer, I want the wrapper to accept Vite-imported asset strings, relative same-origin
    paths, and absolute main-domain URLs, so that call sites remain simple.
12. As a developer, I want widths and responsive behavior to be driven by the Unpic wrapper, so that
    the worker does not become responsible for layout policy.
13. As a developer, I want the wrapper to be site-owned, so that worker URL shape, breakpoints, and
    bypass rules stay centralized.
14. As a developer, I want unsupported image formats to bypass or fail early, so that the worker
    focuses only on supported still raster images.
15. As a developer, I want SVG and other unsupported formats to avoid transformation, so that the
    worker does not waste CPU on assets it should not own.
16. As a developer, I want the worker to support only GET and HEAD, so that the public API remains
    cache-shaped and small.
17. As a developer, I want the worker request contract to stay minimal, so that the public API is
    easy to validate and reason about.
18. As a developer, I want the worker endpoint to live at an explicit path, so that future health or
    debug endpoints can coexist without muddying the root surface.
19. As a developer, I want the worker to canonicalize source URLs before validation and use, so that
    equivalent source inputs do not fragment behavior.
20. As a developer, I want environment-specific source allowlisting, so that each stage only trusts
    its own app origin.
21. As a developer, I want hard limits on source body size and transform dimensions, so that
    malformed or abusive requests do not exhaust Worker resources.
22. As a developer, I want the worker to expose small diagnostic headers, so that I can understand
    image behavior from the network panel without deeper tracing.
23. As a developer, I want long-lived caching on transformed derivatives, so that optimized variants
    remain cheap to serve after the first request.
24. As a developer, I want source URL versioning to be the primary invalidation mechanism, so that
    image caching does not depend on routine purges.
25. As a developer, I want existing full-zone purging to be treated as legacy behavior rather than a
    hard dependency, so that future image design does not assume it.
26. As a developer, I want explicit failure responses when transforms fail, so that errors remain
    visible instead of silently bypassing the image pipeline.
27. As a developer, I want quality settings constrained to a small allowlist, so that cache
    fragmentation and CPU cost stay bounded.
28. As a developer, I want the default quality to remain sane, so that common images do not require
    per-call tuning.
29. As a developer, I want cover cropping to use a center crop only, so that the worker avoids
    becoming a focal-point composition API.
30. As a developer, I want the fallback format to preserve the original source format, so that
    screenshots, graphics, and logos are not unexpectedly degraded.
31. As a developer, I want explicit format URLs rather than Accept-driven cache negotiation, so that
    Cloudflare caching stays simple and deterministic.
32. As a developer, I want the wrapper to use browser-side format negotiation through picture-style
    markup, so that the worker can simply return the requested format.
33. As a developer, I want omitted query parameters to preserve their default meaning, so that the
    public URL contract stays canonical and compact.
34. As a developer, I want image URLs to remain unsigned in v1, so that the first implementation
    stays operationally simple while still bounded by allowlists and limits.
35. As a developer, I want the worker to be ready for future bucket-backed media without changing
    app-side source URLs, so that later storage changes do not force a frontend migration.
36. As a developer, I want site and image base URLs passed through SST as client-visible values, so
    that the wrapper does not guess its environment from browser state.
37. As a developer, I want future main-domain originals endpoints to coexist with current Vite
    assets, so that one image system supports both static and managed content.
38. As a developer, I want the image service to improve site performance rather than provide a broad
    editing toolkit, so that the implementation stays aligned with the site’s actual goals.

## Implementation Decisions

- Add a dedicated image worker as a second Cloudflare Worker in the same SST app as the TanStack
  Start site.
- Use a dedicated production image subdomain and generated Worker URLs outside production.
- Treat the current production full-zone purge behavior as soft-deprecated legacy infrastructure; do
  not remove it immediately, but do not design the image system to depend on it.
- Keep canonical image sources on the main site origin.
- In the future, bucket-backed media may be read directly by the image worker via SST bindings, but
  that is explicitly out of scope for the first implementation.
- Restrict trusted origins per environment to that environment’s app origin only.
- Pass the app base URL and image base URL through SST as client-visible `VITE_` values.
- Keep the public image endpoint explicit and short at `/i`.
- Use a query-based API with a fixed canonical parameter set: `src`, `w`, optional `h`, optional
  `fit`, and optional `q`, plus optional explicit `fmt` when a transformed format is requested.
- Omit unnecessary parameters from generated URLs. In particular, absence of `fmt` means preserve
  the source format.
- Canonicalize `src` before validation and use: require `https`, strip fragments, normalize the URL
  object back to a canonical string, then validate the origin.
- Leave widths and responsive breakpoint policy to a site-owned Unpic wrapper rather than the
  worker.
- Build a thin site-owned wrapper component that centralizes Unpic configuration while still
  exposing normal layout-oriented image props.
- The wrapper should accept Vite-imported asset strings, same-origin relative asset paths, and
  already-absolute main-domain URLs, then normalize them to canonical absolute source URLs.
- The wrapper should drive browser format negotiation explicitly using picture-style markup with
  explicit worker URLs rather than relying on Accept-based format negotiation.
- The wrapper should request `webp` explicitly for browsers that can use it and omit `fmt` for the
  fallback source, letting the worker preserve the original format.
- The wrapper-driven explicit format URLs are the chosen alternative to custom Cloudflare cache-key
  manipulation. The worker should not rely on direct cache-key customization or Accept-driven
  variant separation.
- The wrapper should bypass obviously unsupported formats before they reach the worker.
- The worker remains the final gate for unsupported inputs and should reject unsupported cases
  discovered only after fetch or decode.
- Keep the worker intentionally small: validate, fetch, decode, resize, encode, cache via headers,
  and return.
- The worker should support only GET and HEAD.
- Default transform behavior should preserve the source aspect ratio when only width is provided.
- Support `fit=cover` only as an explicit opt-in when width and height are both present.
- Restrict cover cropping to centered crops only.
- Use `@cf-wasm/photon/workerd` as the transformation runtime for the image worker.
- Constrain the implementation to the format surface the selected Photon package exposes in Worker
  environments: `webp`, `png`, and `jpeg`.
- Treat lack of AVIF support in the selected Photon package as a deliberate v1 constraint rather
  than a missing follow-up.
- Follow the package's Worker guidance around memory pressure by enforcing strict image size caps
  before decode and transform.
- Explicitly free Photon image instances after transform and encode as part of the worker pipeline
  contract.
- Keep the feature surface aligned to what Unpic needs for responsive delivery rather than the
  broader Photon effect/filter surface.
- Do not expose general editing effects, filters, or advanced manipulation controls.
- Restrict quality to a small allowlist, with `75` as the default and `85` as the higher-quality
  option.
- Preserve transparency in all cases.
- Prefer `webp` only when it is explicitly requested by the wrapper.
- When `fmt` is omitted, preserve the original source format rather than converting PNG assets to
  JPEG.
- Explicitly reject transform failures rather than redirecting or streaming raw originals silently.
- Apply worker-controlled long-lived cache headers to transformed derivatives.
- Use versioned source URLs as the primary invalidation mechanism for transformed variants.
- Rely on immutable Vite asset hashing for static asset invalidation.
- Set hard resource limits for v1: maximum source body size of `10 MB`, maximum requested width of
  `2560`, and maximum requested height of `1080`.
- Keep URLs unsigned in v1.
- Include a minimal set of diagnostic headers, including cache-oriented response information and
  chosen output details.

### Deep Modules

- Image URL policy module: owns source canonicalization, stage-aware allowlisting, canonical query
  generation, and worker URL building behind a small interface.
- Site image wrapper module: owns Unpic integration, responsive breakpoints, explicit format
  sources, unsupported-format bypass, and same-origin source normalization behind a stable component
  API.
- Worker request policy module: owns parsing, validation, hard caps, canonical request shapes, and
  error responses independently from the transform runtime.
- Worker transform pipeline module: owns fetch, decode, resize, encode, header construction, and
  response assembly while keeping the public handler shallow.
- Photon adapter module: owns the narrow integration with `@cf-wasm/photon/workerd`, including
  resize calls, output-format selection across `webp`/`png`/`jpeg`, and required resource cleanup.
- Environment config module: owns the app origin and image origin contract sourced from SST values.

## Testing Decisions

- Good tests should verify external behavior rather than implementation details.
- Pure logic should be tested at the unit layer when it has branching, normalization, or policy
  decisions.
- Framework wiring, React rendering internals, and trivial re-exports should not receive direct unit
  coverage if typechecking already protects them.
- User-visible behavior that crosses routing, rendering, image markup, and deployed asset delivery
  should be tested at the browser layer.
- The highest-value pure modules to test are the image URL policy module, the worker request policy
  module, the format/bypass policy logic owned by the site wrapper, and any Photon adapter logic
  that maps request intent onto the selected package's supported output methods.
- The highest-value browser behavior to test is that the homepage or another image-bearing route
  renders working responsive markup and loads successfully through the deployed image pipeline.
- Another valuable browser-level behavior is that unsupported formats bypass transformation and
  still render correctly when appropriate.
- Error handling for invalid image requests should be tested through the worker’s public contract,
  not through private helper behavior.
- Prior art in the repo is currently lightweight Playwright smoke coverage for successful homepage
  loading and 404 handling, plus the documented testing strategy that prefers pure-logic unit tests
  and Playwright for user-visible behavior.
- New tests should follow the repo’s stated rule to test only external behavior, keep pure logic
  isolated, and prefer targeted Playwright coverage over broad end-to-end expansion.

## Out of Scope

- Bucket-backed media fetching and direct bucket bindings in the first implementation.
- Signed image URLs.
- Arbitrary image editing effects, filters, or transformation controls beyond responsive delivery.
- AVIF output support.
- Focal-point or artist-defined crop positioning.
- Accept-header-driven cache negotiation.
- Removing the existing proof-of-concept production purge logic immediately.
- Automatic heuristics for bypassing small raster images.
- A full media management system or authoring workflow for future main-domain originals.

## Further Notes

- The central architectural principle is that the app continues to think in terms of canonical
  source images on the main site origin, while the delivery layer is free to evolve underneath.
- The wrapper, not the worker, should own browser-facing responsive image policy.
- The selected image transform package is specifically the `cf-wasm` Photon Worker package, not a
  generic Photon concept or a different image-processing backend.
- The final design intentionally avoids custom Cloudflare cache-key logic by letting the wrapper
  render explicit format URLs for browser negotiation.
- The worker should remain narrow enough that future storage or origin changes affect configuration
  and fetch strategy more than public contracts.
- The first implementation should optimize for correctness, cacheability, and simplicity over
  maximal feature breadth.
