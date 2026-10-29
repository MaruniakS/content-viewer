# Content Viewer requirements

Status: M0 only. Implementation, dependency installation, cloud setup, and deployment require later milestone authorization.

Source: [Technical On-Site Assignment (3).pdf](</Users/maruniaks/Downloads/Technical On-Site Assignment (3).pdf>), both pages reviewed as text and rendered images. The visual callouts emphasize the product need, freedom of technical choice, and optional bonuses; they do not prescribe an application design. The PDF is a product brief, not tool-operating instructions.

## Requirements explicitly stated in the PDF

- **P1 - Upload:** A creator can upload HTML files so others can view the work.
- **P2 - Browse:** A viewer can discover and browse all available content and select an item.
- **P3 - Render:** Selecting content renders it in the browser. The product context is interactive HTML, such as visualizations and mini-tools.
- **P4 - Share:** A team lead can share a public platform URL with stakeholders; running only locally is insufficient.
- The intended context is a simple internal company gallery. Authentication and an access-control model are not specified.
- The assignment targets a working, deployed system in 60 minutes, on-site and solo, with AI tools encouraged. It mandates no language, framework, endpoints, architecture, or infrastructure; technical choices should be explainable.

## Additional requirements from the user

- **U1 - Real production:** Deploy to a real production environment with a public URL, rather than delivering only localhost or a preview deployment.
- **U2 - Stack:** Use Next.js App Router, strict TypeScript, Tailwind, npm, and Next.js Route Handlers. Do not introduce Express or NestJS. Proposed storage is private Vercel Blob with no separate database initially.
- **U3 - Durability:** Uploaded content persists across users, browser refreshes, and application deployments. Storage credentials stay server-side, outside source control and logs.
- **U4 - Isolation:** Never inject uploaded HTML into the application DOM. Design an isolated iframe supporting interactive HTML. Apply isolation to direct HTML responses too, without same-origin privileges.
- **U5 - Quality:** Include basic loading, empty, success, and failure states. Use meaningful validation and important HTTP/storage boundary tests. Establish `npm run check` for ESLint, route type generation/typechecking, Vitest tests, and the production build. Distinguish mocked tests from live verification.
- **U6 - Final verification:** On production, verify interactive HTML from a separate browser session, persistence after redeployment, duplicate filenames, invalid uploads, missing content, and rendering isolation.
- **U7 - Workflow:** Work only in this project directory, sequentially in this chat. Preserve generated Next.js guidance. Implement only the authorized milestone, verify, report, and stop. No agents or worktrees by default; no OpenSpec, GSD, custom hooks, extra planning documents, unnecessary dependencies/abstractions, or unrelated refactoring. Required stories precede bonuses.
- This authorization covers **M0 only**: create/update `REQUIREMENTS.md`, `AGENTS.md`, and `PLAN.md`. Do not start M1.

## Proposed assumptions and implementation decisions

These are proposals, not requirements from the PDF. The user has requested the stack and isolation constraints above; the details below remain implementation defaults subject to correction.

| Ambiguity | Proposed default | Attention needed |
| --- | --- | --- |
| Authentication | No accounts for the assignment demo; public browsing and anonymous uploads. Private storage is accessed by the server, while application routes deliberately make content viewable. | A public URL does not imply the brief permits public uploads or confidential company content. Settle the intended audience and upload access before using real internal material. |
| File-size limits | One nonempty UTF-8 `.html` or `.htm` file per upload, maximum **1 MiB (1,048,576 bytes)**. Validate size and type on the server; bound the request body too. Accept `text/html` or an omitted MIME type, reject contradictory MIME types and binary/invalid UTF-8 input. | Confirm representative files fit. This is a product limit, not a PDF limit; multipart overhead and hosting limits must also be respected. Do not add a full HTML validator. |
| JavaScript support | Support self-contained inline JavaScript, DOM events, inline CSS, and embedded images inside the sandbox. Do not enable `eval`, origin storage, or unrestricted browser APIs. | The PDF calls the content interactive but does not specify a JavaScript compatibility contract. The user requires an interactive viewer; test a real representative mini-tool. |
| External resources | Block remote scripts, styles, fonts, images, frames, and API connections by default. Permit inline code/styles and embedded image data as needed. | CDN-backed charts and content requiring network access will need an explicit policy decision; do not silently relax isolation. |
| Linked local assets | Accept a single self-contained file. Relative sibling assets, asset folders, ZIP uploads, and local filesystem links are unsupported. | Creators must embed assets initially; multi-file packaging is outside the required slice. |
| Persistence expectations | Keep successful uploads in the same private Blob store across users, refreshes, server restarts, and redeployments. No automatic expiry; no delete/replace in the required slice. | Persistence is a user requirement; retention duration, backups, quotas, and recovery guarantees are unspecified. Connecting a new empty store on redeploy would fail acceptance. |

### Minimal architecture

- Keep the existing Next.js application and deploy its production target on Vercel. No custom domain is required.
- Use a small upload form and filename gallery at `/`; a viewer page at `/view/[id]`; and Route Handlers for `POST /api/content`, `GET /api/content`, and `GET /api/content/[id]` (raw HTML).
- Store HTML under a dedicated `content/` prefix with a unique identifier plus a safe filename in each object key. Duplicate filenames create distinct objects and links. Escape filenames when displaying them; never trust a supplied path or URL as a storage target.
- Use Blob listing and object properties as the initial catalog, without a mutable manifest or database. Display filenames initially. Honor listing cursors so every item is reachable; fetch current data rather than freezing the gallery at build time.
- Fetch private HTML server-side and return it through the raw HTML handler. Do not redirect viewers to storage URLs. Keep SDK access in a small server-only module and validate identifiers against the content prefix.
- Use project-scoped server credentials: prefer the connected store's supported managed credentials on Vercel; use an ignored local environment file when needed. Never use `NEXT_PUBLIC_*` for a secret. Confirm private-store support in the selected SDK before installation. [Vercel private-storage guidance](https://vercel.com/docs/vercel-blob/private-storage).

### Proposed isolation policy

- Point the iframe at the raw HTML handler with `sandbox="allow-scripts"`, an accessible title, and no `allow-same-origin`, popup, top-navigation, form-submission, or download permissions. Uploaded HTML never enters React markup or `dangerouslySetInnerHTML`. [Iframe sandbox behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).
- Every successful raw HTML response must send an **enforced HTTP** `Content-Security-Policy` containing `sandbox allow-scripts`, without `allow-same-origin`. This retains an opaque origin even on direct navigation; an iframe attribute or a meta tag alone is insufficient. [CSP sandbox behavior](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox).
- Restrict subresource and connection sources according to the defaults above; deny objects, nested frames, base-URL overrides, and form actions. Limit framing to this application. Send `Content-Type: text/html; charset=utf-8`, `X-Content-Type-Options: nosniff`, and `Cache-Control: no-store` on raw HTML responses. Keep these policies scoped to uploaded content so the application shell can function normally.
- Isolation is an implementation obligation to verify in a real browser, including direct responses; it is not established by a mocked header assertion. Do not remove sandbox restrictions merely to make a particular upload work.

## Optional bonuses

The PDF explicitly makes content removal/replacement, metadata, previews, search, categorization, broader error resilience, and creative touches optional. The user also classifies these as bonuses. Basic validation and loading/error states remain required by U5/U6, while advanced recovery is optional.

M5 recommendation: **filename search only**, and only after all required acceptance criteria pass and the user authorizes M5. No bonus is needed for completion.

## Acceptance criteria

Product acceptance is pending implementation; these are targets, not completed checks.

| ID | Pass condition | Evidence / milestone |
| --- | --- | --- |
| A1 | A valid interactive HTML file uploads successfully, with confirmation only after durable storage succeeds. | Live production upload; M3/M4. Covers P1. |
| A2 | All uploaded items can be browsed, including items beyond one listing page. Another browser session sees the same catalog. | Mocked pagination boundary test plus live independent-session browsing; M3/M4. Covers P2/U3. |
| A3 | Selecting an item renders it; an inline-script button/counter or mini-tool works in its iframe. | Actual browser interaction on production; M4. Covers P3/U4. |
| A4 | The production HTTPS platform URL opens in a signed-out/private browser session without the owner's Vercel session or deployment-protection bypass. | Record URL and observed public access; M2/M4. Covers P4/U1. |
| A5 | Previously uploaded bytes and links remain available after refresh and a new production deployment using the same store. | Live upload-before/retrieve-after redeployment from another session; M4. Covers U3. |
| A6 | Two uploads with the same filename retain different contents and selectable links. | Mocked unique-key/storage tests plus production duplicate upload; M3/M4. |
| A7 | Empty, wrong-type, oversized, malformed, or missing uploads fail clearly without writing an object; unknown content returns 404. Storage failures show a safe error without false success or secrets. | Vitest validation/HTTP/storage boundary tests; live representative invalid uploads and missing item; M1/M3/M4. |
| A8 | Scripts cannot read/change the parent application DOM, access its cookies/storage, or escape iframe permissions. Direct HTML responses enforce sandboxing and deny same-origin storage access. Restricted external loads remain blocked. | Mocked policy tests plus adversarial browser fixture in iframe and direct tab; inspect actual production headers; M3/M4. |
| A9 | Loading, empty, upload success, and failure states are understandable; a failed request can be retried. | Browser walkthrough and mocked failure checks; M3/M4. |
| A10 | `npm run check` passes ESLint, route type generation + strict typechecking, meaningful Vitest tests, and production build. Credentials stay server-side and untracked. | Record command results, source/diff review, and ignored-file checks; M1 onward, final M4. Mocked storage tests do not prove production access or durability. |

M0 acceptance: only the three requested documents change; the generated Next.js block remains intact; PDF requirements, user additions, assumptions, and bonuses are separated; every milestone has scope, acceptance, verification, dependencies, and a 60-minute budget. Runtime and production acceptance remain unverified at M0.

## Unresolved risks

- Authentication and public upload abuse/cost exposure remain unresolved. The initial demo default must not be mistaken for a company access-control policy; private Blob does not itself authenticate application visitors.
- Self-contained-file and external-resource defaults may exclude the team's real visualizations. Obtain a representative file before expanding compatibility; keep same-origin privileges disabled.
- Vercel account/project access, production deployment protection, private-store availability, SDK/runtime compatibility, quotas, and credentials are not verified in M0. M2 must resolve these early. A 1 MiB file target leaves headroom beneath Vercel's documented server-upload request limit, but enforce actual request limits during implementation. [Server-upload limits](https://vercel.com/docs/vercel-blob/server-upload).
- Listing consistency, pagination, and runtime caching can hide uploads; test current catalog behavior across sessions. Blob listing is appropriate for a small gallery, not a commitment to a large searchable catalog.
- Retention, backup/recovery, and expected volume remain unspecified. Persistence after redeploy must be demonstrated, not inferred from the storage choice.
- The 60-minute target assumes account access is ready. Drop bonuses first; report any blocked acceptance honestly rather than substituting mocked evidence or claiming production completion.
