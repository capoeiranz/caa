## Deployment Notes

- Cloudflare Workers deployment is configured through `@cloudflare/vite-plugin` in `vite.config.ts`.
- Production build command: `pnpm build`
- Local preview command: `pnpm preview`
- Dry-run deploy command: `pnpm deploy:dry-run`
- Live deploy command: `pnpm deploy`
- Direct Wrangler access is exposed through `pnpm wrangler`
- Generate Worker binding types with `pnpm typegen` after changing `wrangler.jsonc`.
- Keep `@tanstack/devtools-vite` first in the Vite plugin array.
- Keep the Cloudflare plugin ahead of TanStack Start so workerd owns the SSR runtime.
- Keep `tanstackStart()` before `viteReact()` in the Vite plugin array.
- Deployments are now managed by SST (`sst.config.ts`) using `sst.cloudflare.TanStackStart`.
- Preview deploys run from pull requests and deploy to stage `pr-<number>`.
- Production deploys run from pushes to `main` and deploy to stage `production`.
- Production custom domains are managed in `sst.config.ts` as code.
- The deploy workflow reads `.sst/outputs.json` and uses the `url` output for smoke tests.
- Closed pull requests remove their stage with `.github/workflows/preview-cleanup.yml`.
- Preview deploys use Cloudflare worker URLs by default (no custom preview domain required).
- Protected smoke tests use Cloudflare Access service-token headers via
  `CLOUDFLARE_ACCESS_CLIENT_ID` and `CLOUDFLARE_ACCESS_CLIENT_SECRET` GitHub secrets.
