<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Content Viewer workflow

- Read `REQUIREMENTS.md` and `PLAN.md` before implementation. Keep PDF requirements, user additions, assumptions, and bonuses distinct.
- Work only in this project directory, sequentially in this chat. Do not create agents or worktrees by default. Implement only the milestone the user authorizes, verify it, report results, then stop. Current authorization: M0 only; wait before M1.
- Use Next.js App Router, strict TypeScript, Tailwind, and npm. Use Next.js Route Handlers; no Express or NestJS. Preserve the generated guidance above and consult installed Next.js guides before code changes.
- For library/platform-specific work, resolve the library ID and fetch current documentation through Context7. Check against the installed version.
- Proposed storage: private Vercel Blob with no separate database initially; derive the initial catalog from object listings and honor pagination. Uploaded content must persist across users, refreshes, and deployments.
- Keep storage access server-only and credentials in deployment environment settings or ignored local environment files, outside version control, client bundles, and logs. Never expose secrets through `NEXT_PUBLIC_*`.
- Never inject uploaded HTML into the application DOM. Design an isolated iframe supporting interactive HTML with `sandbox="allow-scripts"` and no `allow-same-origin` or escape permissions. Enforce matching HTTP CSP sandboxing on direct HTML responses too; never grant uploaded content same-origin privileges. Follow the resource policy in `REQUIREMENTS.md`.
- Implement required stories and basic loading/empty/success/failure states before bonuses. Avoid unnecessary dependencies, abstractions, and unrelated refactoring. Do not add OpenSpec, GSD, custom hooks, or extra planning documents.
- Use meaningful tests for validation and important HTTP/storage boundaries, including invalid uploads, duplicate names, pagination, missing content, safe storage failures, and response isolation. Keep configuration minimal.
- Once M1 establishes it, run `npm run check` before claiming implementation completion: ESLint, route type generation/typechecking, Vitest, and production build. Also perform the authorized milestone's live checks. Distinguish mocked tests, local checks, and live production verification; never claim persistence or browser isolation from mocks alone.
