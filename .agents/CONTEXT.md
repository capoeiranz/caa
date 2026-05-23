# CAA

This context defines the language for site-owned images and their responsive delivery. It exists so
frontend markup, media URLs, and delivery behavior use the same terms when talking about originals
and derived variants.

## Language

**Original Image**: The canonical site-owned image reference used by the app. Responsive delivery
starts from an Original Image rather than from a pre-sized derivative. _Avoid_: source variant,
transformed image, external image URL, query-versioned path

**Responsive Variant**: A derived still image identified by an Original Image and a target width. A
Responsive Variant preserves the Original Image's aspect ratio. _Avoid_: crop, fixed-height variant,
edited image

**Encoded Format**: The file encoding of an image, such as PNG, WebP, or JPEG. Encoded Format is
distinct from image properties like width, aspect ratio, or alpha. _Avoid_: format

## Flagged Ambiguities

- **Format**: Resolved to **Encoded Format** when discussing PNG, WebP, or JPEG. Width, aspect
  ratio, and alpha are image properties, not formats.
- **Image source**: Resolved to site-owned image paths only. Absolute URLs are not part of the
  current wrapper contract.
- **Source query strings**: Resolved out of scope. Original Images are plain site-owned paths
  without query-string identity.

## Example Dialogue

Dev: This hero is loading the Original Image directly.

Domain expert: It should load a Responsive Variant instead, but the content model should still point
at the Original Image.

Dev: So the page chooses widths, and each requested Responsive Variant keeps the Original Image's
aspect ratio.

Domain expert: Right. We are delivering responsive variants, not authoring crops.
