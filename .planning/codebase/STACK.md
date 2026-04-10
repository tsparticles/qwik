# Technology Stack

**Analysis Date:** 2026-04-10

## Languages

**Primary:**

- TypeScript 5.2.2 - Library source in `src/**/*.ts` and `src/**/*.tsx`, configured by `tsconfig.json` and declared in `package.json`.

**Secondary:**

- JavaScript (ESM/CJS outputs) - Distributed build artifacts in `lib/index.qwik.mjs` and `lib/index.qwik.cjs`, defined in `package.json` exports and Vite lib build in `vite.config.ts`.
- YAML - Workspace and CI configuration in `pnpm-workspace.yaml` and `.github/workflows/nodejs.yml`.

## Runtime

**Environment:**

- Node.js >=15.0.0 required by `package.json` (`engines.node`).
- CI executes on Node.js 20 in `.github/workflows/nodejs.yml`.

**Package Manager:**

- pnpm 10.33.0 specified in `package.json` (`packageManager`).
- Lockfile: present (`pnpm-lock.yaml`).

## Frameworks

**Core:**

- Qwik 1.2.18 (`@builder.io/qwik`) - Component and SSR framework used in `src/components/particles/particles.tsx`, `src/entry.dev.tsx`, and `src/entry.ssr.tsx`.
- tsParticles 4.0.0-beta.11 (`@tsparticles/engine`, `@tsparticles/all`) - Particle engine integration used in `src/components/particles/particles.tsx` and `src/root.tsx`.

**Testing:**

- Not detected (no `vitest.config.*`, `jest.config.*`, or test scripts in `package.json`).

**Build/Dev:**

- Vite 4.4.9 (`vite`) - Dev server and library bundler configured in `vite.config.ts` and invoked by `package.json` scripts (`dev`, `start`, `build.lib`).
- Qwik optimizer (`@builder.io/qwik/optimizer`) - Vite plugin in `vite.config.ts` (`qwikVite()`).
- TypeScript compiler 5.2.2 (`typescript`) - Type declaration generation via `package.json` script `build.types`.
- Nx (`nx`) and Lerna (`lerna`) - Monorepo orchestration fallback scripts in `package.json` (`build:nx`, `build:lerna`) and caching in `nx.json`.

## Key Dependencies

**Critical:**

- `@builder.io/qwik` 1.2.18 - Required to compile and run Qwik components (`src/components/particles/particles.tsx`) and SSR/client entry points (`src/entry.ssr.tsx`, `src/entry.dev.tsx`).
- `@tsparticles/engine` ^4.0.0-beta.11 - Core particle runtime loaded in `src/components/particles/particles.tsx`.
- `@tsparticles/all` ^4.0.0-beta.11 - Full preset loader used in `src/root.tsx` (`loadAll(engine)`).

**Infrastructure:**

- `vite-tsconfig-paths` 4.2.1 - TypeScript path mapping support in `vite.config.ts`.
- `eslint`, `@typescript-eslint/*`, `eslint-plugin-qwik` - Static analysis configured in `.eslintrc.cjs` and run by `package.json` script `lint`.
- `prettier` 3.1.1 - Formatting via `package.json` scripts `fmt` and `fmt.check`.
- `np` 8.0.4 - Release automation via `package.json` script `release`.

## Configuration

**Environment:**

- Environment variables are not required by detected source/config files (`src/**/*.ts*`, `vite.config.ts`, `package.json`, workflow files).
- `.env` files: Not detected in repository root or subdirectories.

**Build:**

- `vite.config.ts` configures library build target (`es2020`), entry (`./src/index.ts`), and formats (`es`, `cjs`).
- `tsconfig.json` configures strict TypeScript, declarations to `lib-types`, JSX runtime (`@builder.io/qwik`), and module target.
- `package.json` provides build/dev/lint/format/release scripts.

## Platform Requirements

**Development:**

- Node.js and pnpm required (`package.json` + lockfile).
- Vite local dev server for SSR-mode development (`package.json` script `dev`; README section in `README.md`).

**Production:**

- Deployment target is package distribution (npm-style library output), producing `lib/` and `lib-types/` artifacts (`README.md`, `package.json` `files`, and Vite lib build config).
- CI pipeline runs build-only validation on GitHub Actions (`.github/workflows/nodejs.yml`).

---

_Stack analysis: 2026-04-10_
