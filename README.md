# Content Viewer

Upload, browse, and share interactive HTML at **[content-viewer-six.vercel.app](https://content-viewer-six.vercel.app)**.

## Use it

Choose one `.html` or `.htm` file and select **Upload HTML**. Open its gallery entry, interact with the content, and use **Copy share link** to share the viewer. Duplicate filenames create separate entries. Search matches filenames across every storage page; clear the search to return to the paginated collection.

Files must contain nonempty UTF-8 text, be at most **1 MiB**, and have filenames no longer than 240 UTF-8 bytes. Include scripts, styles, and images inside the file. External resources, API requests, relative assets, ZIPs, origin storage, popups, and forms are unsupported. Inline JavaScript and embedded images work. A downloadable counter example is available at `/examples/counter.html` and in `public/examples/counter.html`.

The demo allows public browsing and anonymous uploads. Use material suitable for public sharing. Accounts, access control, deletion/replacement, quotas, and backups are outside this assignment's required slice.

## Local development

Use Node.js 24 LTS and npm:

```sh
npm ci
npx vercel link --project content-viewer
npx vercel env pull .env.local
npm run dev
```

The linked project uses the private **content-viewer-files** Blob store. Keep the same store connected to Production, Preview, and Development. `BLOB_STORE_ID` identifies the store; Vercel supplies managed OIDC credentials in deployment. `vercel env pull` provides ignored local development credentials. A server-only `BLOB_READ_WRITE_TOKEN` also works when managed credentials are unavailable; never use a `NEXT_PUBLIC_*` secret. `.env*` and `.vercel/` are ignored. No separate database or local filesystem catalog is used.

## Architecture

Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, npm, and Node Route Handlers:

- `/`: server-rendered paginated gallery, complete-catalog filename search, and a small client upload form.
- `/view/[id]`: server-validated viewer and client iframe with loading/reload/share feedback.
- `POST /api/content`: bounded multipart parsing, validation before writes, and unique private Blob keys.
- `GET /api/content?cursor=…`: current metadata page. `?q=…` searches the complete catalog.
- `GET /api/content/[id]`: streams private HTML with enforced HTTP CSP sandboxing and no caching.

Components live in `src/components`; helpers and their tests live in `src/utils`. Storage is guarded by `server-only`. Listings supply the catalog and carry SDK cursors through the application. Existing UUID/filename objects remain readable without migration. Uploaded bytes are preserved, including UTF-8 byte order marks.

HTML never enters the application DOM. Both iframe permissions and the raw response's enforced CSP allow scripts while denying same-origin privileges. Default sources and network connections are blocked; inline scripts/styles and embedded image/font data are permitted. Direct navigation retains the opaque-origin sandbox. The application never redirects visitors to private storage URLs.

## Checks and deployment

```sh
npm run check
npx vercel deploy --prod --yes
```

The check runs ESLint, Next route type generation plus strict typechecking, Vitest, and a production build. Individual scripts are `lint`, `typecheck`, `test`, `test:watch`, and `build`. Builds use system fonts and do not fetch fonts from Google. A targeted compatible Zod 4 override removes a transitive Blob SDK advisory.

Tests cover real validation and HTTP/storage integration with only the external Blob SDK mocked. They include invalid requests, size limits including streamed bodies, duplicate keys, pagination/search, legacy keys, missing items, safe outages, and response policies. Mocked tests do not prove live durability or browser isolation. Actual production evidence, including independent Safari Private Browsing and before/after redeployment byte comparisons, is recorded in [PLAN.md](PLAN.md).

Read [REQUIREMENTS.md](REQUIREMENTS.md), [AGENTS.md](AGENTS.md), and [component rules](src/components/RULES.md) for the scope and conventions. The installed Next.js guides are under `node_modules/next/dist/docs/`; automatic generated agent rules remain disabled.
