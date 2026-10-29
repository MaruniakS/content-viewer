# Content Viewer implementation plan

Status: **M1 complete; stop before M2.** The user explicitly authorized M1 project setup and Vitest installation. Read `REQUIREMENTS.md` and `AGENTS.md` first. Work sequentially in this chat and project directory; do not create agents, worktrees, or extra planning documents. Each later milestone needs explicit authorization; verify, report results and limitations, then stop.

Architecture: keep Next.js App Router, strict TypeScript, Tailwind, and npm. Use Route Handlers plus private Vercel Blob, deriving the initial gallery catalog from object listings without a separate database. Serve uploaded HTML through a response-sandboxed route into an iframe that allows scripts without same-origin privileges. Details and proposed compatibility defaults are in `REQUIREMENTS.md`.

## Scaffold inspected in M0

- `package.json` / `package-lock.json`: Next.js **16.4.3**, React/React DOM **19.3.0**, TypeScript **5**, Tailwind **4**, ESLint **9**; npm lockfile present. Existing scripts: `dev`, `build`, `start`, `lint`. No `check`, typecheck, or test script and no Vitest dependency/configuration.
- `src/app/page.tsx`, `layout.tsx`, `globals.css`: starter page, Geist fonts via `next/font/google`, starter metadata, and Tailwind import. App Router already exists; no product routes or storage layer.
- `tsconfig.json`: `strict: true`, `noEmit: true`, `@/*` alias, generated Next.js type includes. `eslint.config.mjs` uses Next.js flat configs.
- `next.config.ts`: existing Turbopack CSS rule using `@tailwindcss/turbopack`; no PostCSS config is present. Preserve and verify this scaffold rather than replacing it from memory.
- `.gitignore` already ignores `.env*`, `.vercel`, `.next`, coverage, and dependencies. `README.md` is generated starter guidance. Root `AGENTS.md` contained only the generated Next.js block; no nested project guidance was found.
- Read the installed Next.js Route Handlers, TypeScript, ESLint, and Vitest guides under `node_modules/next/dist/docs/`; checked current framework/storage documentation via Context7. In particular, generate route types before standalone `tsc`, and run ESLint explicitly. [Next.js CLI](https://nextjs.org/docs/app/api-reference/cli/next), [ESLint guidance](https://nextjs.org/docs/app/api-reference/config/eslint).
- No runtime, lint, typecheck, test, build, cloud, or deployment verification was performed in M0. Installed-package presence is not proof that the baseline runs.

## 60-minute execution budget

These are target active-work allocations for the assignment, including M0; authorization pauses are outside the clock. Account access should be ready before M2. If a gate overruns, use remaining implementation time and cut bonuses first. Keep minutes **50-60 exclusively for production verification and fixes**; never trade them for polish.

| Milestone | Window | Budget |
| --- | --- | --- |
| M0 - Requirements and workflow | 0-5 | 5 min |
| M1 - Running baseline and quality checks | 5-13 | 8 min |
| M2 - Production foundation | 13-23 | 10 min |
| M3 - Working vertical slice | 23-50 | 27 min, including deployment of the slice |
| M4 - Final verification | 50-60 | 10 min reserved for live checks, redeployment, and fixes |
| M5 - Optional bonuses | After M4, only with additional authorized time | 0 min reserved; omit first |

## M0 - Requirements and workflow

**Scope / files:** Inspect scaffold/configuration and existing guidance; read both PDF pages including visuals. Create/update only `REQUIREMENTS.md`, `AGENTS.md`, and `PLAN.md`; record assumptions, acceptance criteria, milestones, and evidence boundaries.

**Acceptance:** PDF requirements and user additions are distinct from proposed defaults and bonuses. All six named ambiguities are explicit. Per the user's follow-up, `AGENTS.md` contains project-specific guidance without the generated Next.js preamble. No application/configuration changes, dependencies, cloud setup, or deployment.

**Verification:** Review each document against the request and PDF; run `git diff --check`; inspect tracked/untracked changes and confirm the generated Next.js preamble is absent from `AGENTS.md`. Remove temporary PDF render files. This is document verification only.

**Dependencies:** None. **Checkpoint:** finish M0, summarize, and wait for M1 authorization.

## M1 - Running baseline and quality checks

**Scope / likely files:** Verify the existing dev server and scaffold with its installed Next.js guides. Update `package.json` / `package-lock.json`; add minimal `vitest.config.mts`. Keep the current ESLint/TypeScript/Tailwind setup unless a verified failure requires a focused fix. Establish initial meaningful tests in `src/utils/upload-validation.test.ts` with only the small pure validation helper needed in `src/utils/upload-validation.ts`; no upload route, UI flow, or storage integration yet.

**User additions:** Keep components in `src/components` and helpers in `src/utils`. Add `src/components/RULES.md`, link it from `AGENTS.md`, and follow Vercel's React/Next.js guidance. Update the existing README with setup and check commands.

**Planned check:** `npm run check` must run, in order, ESLint (`eslint .`), route type generation + typechecking (`next typegen && tsc --noEmit`), tests (`vitest run`), and production build (`next build`). Use npm scripts and minimal Node-environment Vitest configuration; do not install React testing plugins or a browser harness unless needed. Do not allow an empty suite to pass. Next.js supports generating route types before the compiler check. [Type generation guidance](https://nextjs.org/docs/app/api-reference/cli/next#next-typegen-options).

**Acceptance:** The starter page renders locally; the full check exits successfully with strict typing enabled. Validation tests exercise allowed HTML, empty input, filename/MIME mismatch, invalid text, and the 1 MiB boundary. No placeholder assertions, snapshots of starter copy, or tests that merely duplicate config. Cloud credentials are not needed for these checks.

**Verification:** Run the dev server and inspect `/`; run `npm run check` and record results for all four stages. Confirm lockfile changes are limited to the test setup and actual required fixes. A production build is local evidence, not a live deployment check.

**Dependencies:** M0 complete and M1 authorized; proposed validation defaults reviewed. **Checkpoint:** report checks and any baseline limitations, then stop.

## M2 - Production foundation

**Scope / likely files:** Connect this project to Vercel and a private persistent Blob store. Add only the official Blob SDK to `package.json` / lockfile. Use ignored project-local `.vercel/` and environment files as needed; update `README.md` with setup names/instructions, never secret values. Add the small server-only storage module at `src/utils/content-storage.ts` if needed for a live storage smoke check. Record the production URL and milestone evidence in this plan, without extra planning files. No new public diagnostic endpoint is needed.

**Acceptance:** The application shell is deployed to the actual production target and opens publicly over HTTPS without an owner session or deployment-protection bypass. Server-side storage write/list/read succeeds against a private store; anonymous direct storage retrieval is denied. The same store remains connected for subsequent deployments. Credentials are absent from client code, logs, and tracked files.

**Verification:** Run `npm run check`; deploy production; open its URL from a signed-out/private session. Using project-local server tooling, write a harmless test object, list and read it back, then clean up that test object. Verify the storage URL rejects anonymous access. Check ignored-file behavior and review the diff for secrets without printing environment values. Label these checks as live; do not use a mocked SDK as storage evidence.

**Dependencies:** M1 complete and M2 authorized; Vercel account/project permissions and production store access available. **Checkpoint:** report production URL, public-access/storage results, and blockers, then stop.

## M3 - Working vertical slice

**Scope / likely files:** Implement upload -> private persistent storage -> gallery -> isolated interactive viewer. Likely files: `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/upload-form.tsx`, `src/components/content-gallery.tsx`, `src/app/view/[id]/page.tsx`, `src/app/api/content/route.ts`, `src/app/api/content/[id]/route.ts`, and small `src/utils/content-storage.ts`, `upload-validation.ts`, and `viewer-policy.ts` helpers with colocated tests. Extract components only where they earn their place. Update usage notes in `README.md`.

**Acceptance:** A1-A3 and A6-A9 work for the required slice; all catalog entries remain reachable via listing cursors. Use unique filename-safe keys under `content/`, independent of duplicate filenames. Reject invalid uploads before a storage write. Show basic loading, empty, success, and failure/retry states. Reads/listings use current persistent data; no local filesystem, memory, or browser-only persistence. The iframe and every raw HTML response enforce the documented script-enabled sandbox without same-origin privileges. Secrets remain server-side. Deploy the slice to production before minute 50.

**Verification:** Add meaningful Vitest coverage for validation, no writes on invalid uploads, unique keys, list pagination, missing content (404), upload size/type failures (413/415), malformed requests (400), safe storage failures (503), and raw HTML content type/CSP/nosniff/cache headers. Mock the SDK only at the storage boundary and label that evidence as mocked. Run `npm run check`; exercise one real local upload/browse/view flow and production smoke flow with a self-contained interactive file. Inspect the iframe permissions and actual raw-response headers, including direct navigation; test parent DOM/storage access denial in a browser. These live checks supplement unit tests.

**Dependencies:** M2 complete and M3 authorized; use M1 validation and M2 storage connection. **Checkpoint:** report check results, deployed URL, live observations, and remaining M4 checks, then stop.

## M4 - Final verification

**Scope / likely files:** Verify the current slice and make only necessary fixes in affected files/tests; record concise results against A1-A10 in `PLAN.md` and final usage details in `README.md`. No new features. Reserve time for the production redeployment and recheck.

**Acceptance:** Every required A1-A10 criterion passes with evidence. Neither mocks nor a successful build stand in for production behavior. Any unverified or failed criterion remains explicitly open.

**Verification (final 10 minutes):**

1. Run `npm run check` on the final source; rerun affected checks after any fix and ensure the final full check passes.
2. At the production URL, upload a self-contained HTML mini-tool/counter and interact with it. Open a separate private browser session/profile, rather than another tab in the same session; verify public access, catalog, and rendering.
3. Upload two files with the same filename but different contents; confirm separate links and correct bytes. Try empty, wrong-type, and oversized uploads, a malformed request, and a missing content ID. Confirm clear errors and no false gallery entry.
4. Verify actual iframe isolation, blocked external resources, denied parent DOM/cookie/storage access, and direct raw HTML response sandboxing. Inspect production headers and ensure inline interaction still works. Use mocked tests for forced storage outages; report them as mocked.
5. Redeploy production using the same store, refresh in the independent session, and verify the preexisting uploads/links/bytes still work. Recheck the fixed behavior after deployment if changes were necessary. Record the final URL and pass/fail/not-tested evidence, with no secrets.

**Dependencies:** M3 complete and M4 authorized. **Checkpoint:** report final acceptance results and unresolved issues, then stop. Do not claim production completion if account, timing, or verification blocks remain.

## M5 - Optional bonuses

**Scope / likely files:** Recommend at most one small improvement: filename search in `src/components/content-gallery.tsx`, with a behavior test if warranted. It must search the complete catalog or make its pagination behavior explicit. No delete/replace, previews, categories, or richer metadata in this milestone.

**Acceptance:** Only start after all required A1-A10 criteria pass and M5 is explicitly authorized with additional time. The baseline 60-minute budget does not fund bonuses; saved implementation time strengthens verification. Required behavior remains intact. Skipping M5 is a successful required delivery.

**Verification:** Check matching/no-match and clearing the filter; run `npm run check` and verify the updated production gallery if deployed.

**Dependencies:** M4 complete and M5 authorized. **Checkpoint:** report the optional change and evidence, then stop.

## Milestone status

- [x] M0 - Documents prepared; document verification recorded below.
- [x] M1 - Running baseline, folder guidance, and full quality check verified locally.
- [ ] M2 - Not authorized or started.
- [ ] M3 - Not authorized or started.
- [ ] M4 - Not authorized or started.
- [ ] M5 - Optional; not authorized or started.

M0 evidence: both PDF pages reviewed as text and rendered images; scaffold/configuration/guidance inspected; document scope and acceptance coverage reviewed. `git diff --check` and document whitespace checks passed; only the three requested documents changed; the generated Next.js preamble was removed per the user's follow-up; temporary PDF renders were removed. No runtime or production success is claimed.

M1 evidence (2026-10-29):

- Local Next.js 16.4.3 dev server returned `/` with HTTP 200; the actual in-app browser displayed the starter heading, images, and links. No product UI or upload endpoint was added.
- `npm run check` exited 0: ESLint; `next typegen && tsc --noEmit` with strict typing; Vitest 4.1.12, 26/26 real validation tests; Turbopack production build with `/` and `/_not-found` generated. Validation was tested against an unimplemented function first, then the implementation. No storage mocks or cloud calls were involved.
- Vitest 5 conflicted with existing Node 20 type definitions; installed compatible Vitest 4 instead. No existing dependency versions changed in the lockfile. `.mts` makes the Vitest config explicitly ESM without changing the application's module configuration.
- Added component rules linked from `AGENTS.md`, using Vercel's official React Best Practices. Helpers and tests live in `src/utils`; future helper paths in this plan were updated to match the user's folder convention.
- Starting Next.js reproduced automatic reinsertion of the generated agent preamble. Set documented `agentRules: false`; the restarted dev server removed the managed block and preserved project guidance. Existing ESLint, strict TypeScript, and Tailwind/Turbopack configuration otherwise remain intact.
- The first restricted build could not fetch Google fonts and cached a CSS-worker port-permission failure. Cleared only generated `.next/cache/turbopack` and reran the full check with required network/process permissions; all stages passed. Fresh builds need Google's font service for the starter's Geist fonts.
- Final source/diff review and `git diff --check` passed. M1 is local baseline evidence only; production access, persistence, HTTP/storage boundaries, and browser isolation remain pending their milestones. M2 is not authorized or started.
