# Running and deploying

This site uses Next.js App Router. Run `pnpm install` and `pnpm dev` locally.
To check production, run `pnpm build` followed by `pnpm start`.

On Vercel, select the repository root and the Next.js framework preset.
The committed `vercel.json` sets `pnpm build` and `.next` as the output.
Remove any old Vite/Cloudflare build overrides in the project settings.

Set `NEXT_PUBLIC_POSTHOG_KEY` to the PostHog project token and
`NEXT_PUBLIC_POSTHOG_HOST` to the ingestion host in Vercel before building.
These values are public browser configuration; never use a personal API key.
Changing them requires a new deployment.

Writing and images remain under `content/<kind>/<slug>/`. Images referenced
with `./` paths are served from `/content-assets/`. Next.js includes content
files in server deployments. Publish new content by committing and deploying.

The old Sites/Cloudflare build configuration has been removed. This migration
does not change or remove the previously hosted Sites deployment.
