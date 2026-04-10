# Codebase Structure

**Analysis Date:** 2026-04-10

## Directory Layout

```text
qwik/
├── src/                    # Source code for public API, component, and Qwik entries
│   ├── components/         # Feature modules (currently particles component)
│   ├── entry.dev.tsx       # Client-side dev entry
│   ├── entry.ssr.tsx       # SSR streaming entry
│   ├── index.ts            # Public library entry export
│   └── root.tsx            # Demo/root composition using Particles
├── lib/                    # Generated JS bundle output (ignored in git)
├── lib-types/              # Generated .d.ts output (ignored in git)
├── components/             # Architecture notes/docs (non-runtime)
├── .github/workflows/      # CI workflow definitions
├── .planning/codebase/     # Generated codebase mapping docs for orchestration
├── package.json            # Scripts, deps, package exports
├── vite.config.ts          # Build config for library bundle
└── tsconfig.json           # TypeScript compiler config
```

## Directory Purposes

**`src/`:**

- Purpose: Canonical implementation source for the package.
- Contains: Component implementation, type contracts, public re-exports, and render entry files.
- Key files: `src/index.ts`, `src/components/particles/particles.tsx`, `src/components/particles/IParticlesProps.ts`, `src/entry.ssr.tsx`, `src/entry.dev.tsx`, `src/root.tsx`.

**`src/components/`:**

- Purpose: Component modules grouped by feature.
- Contains: `particles` submodule with implementation + types + barrel.
- Key files: `src/components/particles/particles.tsx`, `src/components/particles/index.ts`, `src/components/particles/IParticlesProps.ts`.

**`lib/`:**

- Purpose: Build output JS modules for package consumers.
- Contains: ESM and CJS bundles.
- Key files: `lib/index.qwik.mjs`, `lib/index.qwik.cjs`.

**`lib-types/`:**

- Purpose: Build output declarations consumed by TypeScript users.
- Contains: Generated `.d.ts` files mirroring source structure.
- Key files: `lib-types/index.d.ts`, `lib-types/components/particles/particles.d.ts`, `lib-types/components/particles/IParticlesProps.d.ts`.

**`components/`:**

- Purpose: Supplemental design/usage documentation.
- Contains: Markdown guidance file(s).
- Key files: `components/README.SIGNAL_PATTERN.md`.

**`.github/workflows/`:**

- Purpose: CI pipeline configuration.
- Contains: GitHub Actions workflow(s).
- Key files: `.github/workflows/nodejs.yml`.

**`.planning/codebase/`:**

- Purpose: Machine-consumable architecture/quality/stack mapping docs.
- Contains: Markdown analysis outputs used by planning/execution tooling.
- Key files: `.planning/codebase/STACK.md`, `.planning/codebase/INTEGRATIONS.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/TESTING.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.

## Key File Locations

**Entry Points:**

- `src/index.ts`: Public package export surface.
- `src/entry.dev.tsx`: Development client rendering entry.
- `src/entry.ssr.tsx`: SSR rendering entry.
- `src/root.tsx`: Shared root component rendered by both entries.

**Configuration:**

- `package.json`: NPM metadata, scripts, exports, dependencies.
- `vite.config.ts`: Library build target and bundle format config.
- `tsconfig.json`: Compiler strictness, declaration output, JSX config.
- `.eslintrc.cjs`: Linting rules and parser config.
- `nx.json`: Nx task cache defaults.
- `pnpm-workspace.yaml`: Workspace/allowBuilds config.

**Core Logic:**

- `src/components/particles/particles.tsx`: Runtime integration with `tsParticles.load()`, lifecycle, and cleanup.
- `src/components/particles/IParticlesProps.ts`: Typed interface for integration callbacks and options.
- `src/components/particles/index.ts`: Feature-level barrel exports.

**Testing:**

- `src/**`: Not detected test files (`*.test.*` / `*.spec.*`) in this package source tree.
- `.github/workflows/nodejs.yml`: CI builds package with `pnpm run build:ci` (build-only verification).

## Naming Conventions

**Files:**

- Component implementation uses lowercase filename matching default export: `src/components/particles/particles.tsx`.
- Type interfaces are stored in `I*.ts` files: `src/components/particles/IParticlesProps.ts`.
- Module barrels use `index.ts`: `src/index.ts`, `src/components/particles/index.ts`.
- Qwik entry files use `entry.<mode>.tsx`: `src/entry.dev.tsx`, `src/entry.ssr.tsx`.

**Directories:**

- Feature directories are lowercase singular/plural domain names: `src/components/particles/`.
- Output directories are build-artifact oriented: `lib/`, `lib-types/`.

## Where to Add New Code

**New Feature:**

- Primary code: Add a new feature folder under `src/components/<feature>/` with implementation + types + barrel, then export from `src/index.ts`.
- Tests: Add test files adjacent to new modules (for example `src/components/<feature>/<name>.spec.tsx`) since no dedicated `tests/` directory exists.

**New Component/Module:**

- Implementation: Place in `src/components/<feature>/<component>.tsx`.
- Public export wiring: Add re-exports in `src/components/<feature>/index.ts` and `src/index.ts`.

**Utilities:**

- Shared helpers: Create `src/lib/` (not currently present) for cross-component utilities, then import from component modules via relative paths or configured path aliases.

## Special Directories

**`lib/`:**

- Purpose: Compiled JavaScript artifacts.
- Generated: Yes.
- Committed: No (`.gitignore` includes `/lib`).

**`lib-types/`:**

- Purpose: Generated declaration artifacts.
- Generated: Yes.
- Committed: No (`.gitignore` includes `/lib-types`).

**`node_modules/`:**

- Purpose: Installed dependency tree.
- Generated: Yes.
- Committed: No (`.gitignore` includes `node_modules`).

**`.planning/codebase/`:**

- Purpose: Planning-time architecture/quality metadata.
- Generated: Yes (by mapping workflows).
- Committed: Yes (not ignored).

---

_Structure analysis: 2026-04-10_
