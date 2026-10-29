# Content Viewer

Next.js 16 App Router project using strict TypeScript, React 19, Tailwind 4, ESLint, and npm. M1 establishes the running starter and validation checks; the upload/gallery/viewer flow and Vercel storage/deployment belong to later milestones in [PLAN.md](PLAN.md).

## Local development

Use Node.js 24 LTS and npm (M1 verified with Node 24.22.1).

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). M1 needs no credentials or environment file. The starter uses `next/font/google` for Geist, so a fresh build needs access to Google's font service.

## Structure

- `src/app`: App Router pages, layouts, route handlers, and global styles.
- `src/components`: application UI components. Read [component rules](src/components/RULES.md), also linked from [AGENTS.md](AGENTS.md). The rules follow Vercel's React/Next.js guidance.
- `src/utils`: non-UI helpers and their colocated tests. `upload-validation.ts` validates file metadata and UTF-8 bytes; it does not parse, sanitize, or sandbox HTML.

## Quality checks

```sh
npm run check
```

Runs ESLint, Next.js route type generation and strict TypeScript checking, Vitest, then a production build, stopping at the first failure. Vitest uses a Node environment and fails if no tests are found.

Individual commands are `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Use `npm run test:watch` during development. Vitest 4 is used to retain compatibility with the scaffold's Node type definitions.

The validation tests cover HTML extensions/MIME types, empty input, invalid UTF-8/binary input, and the 1 MiB byte limit. HTTP/storage tests and live persistence/isolation checks will be added in their authorized milestones. A local build or unit test does not establish production behavior.

## Project guidance

Read [REQUIREMENTS.md](REQUIREMENTS.md), [PLAN.md](PLAN.md), and [AGENTS.md](AGENTS.md) before implementation. Next.js automatic agent-rule generation is disabled to preserve the project-owned guidance; consult `node_modules/next/dist/docs/` for the installed version's documentation.
