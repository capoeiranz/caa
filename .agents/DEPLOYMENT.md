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
- Deployments are managed by Wrangler using `wrangler.jsonc` and `scripts/deploy-worker.sh`.
- Preview deploys run from pull requests and deploy isolated Workers named `caa-pr-<number>`.
- Production deploys run from pushes to `main` and attach the hostname from
  `CLOUDFLARE_PRODUCTION_BASE_URL`.
- The deploy workflow reads Wrangler deploy output and uses the emitted `url` for smoke tests.
- Closed pull requests delete their preview Worker with `.github/workflows/preview-cleanup.yml`.
- Preview deploys use each PR Worker's `workers.dev` URL by default.
- `VITE_IMAGE_BASE_URL` currently targets `https://img.capoeira.org.nz` in all environments.
- Protected smoke tests use Cloudflare Access service-token headers via
  `CLOUDFLARE_ACCESS_CLIENT_ID` and `CLOUDFLARE_ACCESS_CLIENT_SECRET` GitHub secrets.
