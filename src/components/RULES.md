# Component rules

Read this file before adding or changing application components in `src/components`.

- Keep reusable and feature UI here, with descriptive kebab-case filenames and PascalCase component names. Keep Next.js route entry points, layouts, and special route files in `src/app`; put non-UI helpers in `src/utils`.
- Use Server Components by default. Add `"use client"` only to the smallest component that needs state, event handlers, effects, or browser APIs. Keep credentials and storage SDK access server-only; pass only the data a client component needs.
- Prefer small, typed props and composition. Extract a component when it has a clear responsibility; avoid speculative abstractions and wrapper components.
- Import local components and helpers directly from their files. Do not add barrel exports or dependencies for simple UI.
- Compute derived values during rendering. Handle user actions in event handlers; use effects only to synchronize with external systems. Add memoization only when justified by measured work.
- Use semantic HTML, labeled inputs, accessible button names, visible focus states, and Tailwind styles. Cover loading, empty, success, and failure states when implementing the relevant flow.
- Render uploaded filenames as text. Never inject uploaded HTML into React or the application DOM. Uploaded content belongs in the isolated iframe described in `REQUIREMENTS.md`.
- Add behavior tests where they protect a meaningful contract. Run `npm run check` and inspect relevant UI in a real browser before reporting completion.

Follow [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices), particularly [direct imports](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/bundle-barrel-imports.md), [derived values](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-derived-state-no-effect.md), and [minimal client props](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/server-serialization.md). Consult the installed Next.js guides and Context7 for version-specific APIs; these rules do not require installing libraries mentioned in upstream examples.
