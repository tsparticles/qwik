# Coding Conventions

**Analysis Date:** 2026-04-10

## Naming Patterns

**Files:**

- Use lowercase file names for runtime modules: `src/index.ts`, `src/root.tsx`, `src/entry.dev.tsx`, `src/entry.ssr.tsx`, `src/components/particles/particles.tsx`.
- Use PascalCase for type/interface declaration files: `src/components/particles/IParticlesProps.ts`.
- Use directory-level barrel files named `index.ts`: `src/components/particles/index.ts`.

**Functions:**

- Use camelCase for local functions and callbacks (`loadParticles`, `initParticles` in `src/components/particles/particles.tsx`).
- Use PascalCase for component identifiers (`Particles` in `src/components/particles/particles.tsx`).

**Variables:**

- Use camelCase for standard locals (`id`, `url`, `options` in `src/components/particles/particles.tsx`).
- Use `Sig` suffix for signal values (`initSig`, `librarySig` in `src/components/particles/particles.tsx`).
- Use `FC` suffix for callback props extracted from props (`InitFC` in `src/components/particles/particles.tsx`).

**Types:**

- Prefix interfaces with `I` (`IParticlesProps` in `src/components/particles/IParticlesProps.ts`).
- Use type-only imports for external types (`import type { Container } from "@tsparticles/engine"` in `src/components/particles/particles.tsx`).

## Code Style

**Formatting:**

- Tool used: Prettier (`prettier` script in `package.json`).
- Key settings: No dedicated `.prettierrc` detected; rely on Prettier defaults plus ignore rules in `.prettierignore`.
- Current source style uses double quotes and trailing commas in multiline literals (for example `src/components/particles/particles.tsx`, `vite.config.ts`).

**Linting:**

- Tool used: ESLint with TypeScript and Qwik plugins (`.eslintrc.cjs`).
- Base config extends `eslint:recommended`, `plugin:@typescript-eslint/recommended`, and `plugin:qwik/recommended` (`.eslintrc.cjs`).
- Enforced rule: `@typescript-eslint/no-unused-vars` as error (`.eslintrc.cjs`).
- Relaxed rules include `no-console`, `@typescript-eslint/no-explicit-any`, and several strict TS rules disabled (`.eslintrc.cjs`).

## Import Organization

**Order:**

1. Framework/runtime imports (`@builder.io/qwik` in `src/components/particles/particles.tsx`)
2. External library imports (`@tsparticles/engine` in `src/components/particles/particles.tsx`)
3. Local relative imports (`./IParticlesProps` in `src/components/particles/particles.tsx`)

**Path Aliases:**

- Not used in runtime source under `src/`; imports are relative (`./components/particles` in `src/index.ts`).
- `vite-tsconfig-paths` is configured in `vite.config.ts`, but no alias usage is present in source files.

## Error Handling

**Patterns:**

- Prefer guard clauses for early exits (`if (!initSig.value) return;` in `src/components/particles/particles.tsx`).
- Cleanup is handled through Qwik lifecycle hooks rather than `try/catch` in runtime component logic (`cleanup(() => { ... })` in `src/components/particles/particles.tsx`).
- No centralized app-wide error abstraction detected in `src/`.

## Logging

**Framework:** console

**Patterns:**

- `no-console` is explicitly allowed by ESLint (`.eslintrc.cjs`).
- No active logging statements are present in current `src/` files.

## Comments

**When to Comment:**

- Use block comments to explain entry-point purpose and runtime mode (`src/entry.dev.tsx`, `src/entry.ssr.tsx`).
- Use focused JSDoc on exported component contracts (`src/components/particles/particles.tsx`).

**JSDoc/TSDoc:**

- Lightweight JSDoc is used for component props context (`src/components/particles/particles.tsx`).
- Full API-level TSDoc blocks are not consistently used across `src/`.

## Function Design

**Size:**

- Keep component bodies moderate and encapsulate async steps in local helpers (`loadParticles`, `initParticles` inside `Particles` in `src/components/particles/particles.tsx`).

**Parameters:**

- Use strongly typed props on components (`component$<IParticlesProps>` in `src/components/particles/particles.tsx`).
- Allow optional callback props for extension points (`init`, `loaded` in `src/components/particles/IParticlesProps.ts`).

**Return Values:**

- Components return JSX trees (`Particles` in `src/components/particles/particles.tsx`, default export in `src/root.tsx`).
- Async helpers return `Promise<void>` when used for side-effect orchestration (via inferred async returns in `src/components/particles/particles.tsx`).

## Module Design

**Exports:**

- Use barrel exports for public module surface (`src/components/particles/index.ts`, `src/index.ts`).
- Export both default component and named alias from feature module (`src/components/particles/index.ts`).
- Export prop type aliases alongside interfaces (`ParticlesProps` alias in `src/components/particles/index.ts`).

**Barrel Files:**

- Barrel file pattern is active in `src/components/particles/index.ts` and root barrel `src/index.ts`.

---

_Convention analysis: 2026-04-10_
