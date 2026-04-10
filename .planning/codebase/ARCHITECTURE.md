# Architecture

**Analysis Date:** 2026-04-10

## Pattern Overview

**Overall:** Single-package component-library architecture with a thin public API over a Qwik component and tsParticles runtime integration.

**Key Characteristics:**

- Library-first entrypoint in `src/index.ts` that re-exports public components only.
- Feature-oriented component module in `src/components/particles/` with colocated types and barrel export.
- Dual runtime entrypoints for SSR and client dev in `src/entry.ssr.tsx` and `src/entry.dev.tsx` used for rendering/demo flows.

## Layers

**Public API Layer:**

- Purpose: Expose stable import surface for consumers.
- Location: `src/index.ts`, `src/components/particles/index.ts`
- Contains: Named exports (`Particles`) and exported prop types (`IParticlesProps`, `ParticlesProps`).
- Depends on: Component implementation in `src/components/particles/particles.tsx`.
- Used by: Package consumers through `package.json` exports and Vite lib entry `vite.config.ts`.

**Component Implementation Layer:**

- Purpose: Implement Qwik UI lifecycle and tsParticles container lifecycle.
- Location: `src/components/particles/particles.tsx`
- Contains: `component$` component, `useSignal` state, `useVisibleTask$` initialization, cleanup on unmount.
- Depends on: `@builder.io/qwik`, `@tsparticles/engine`, and prop contract in `src/components/particles/IParticlesProps.ts`.
- Used by: Public API in `src/components/particles/index.ts` and demo root in `src/root.tsx`.

**Type Contract Layer:**

- Purpose: Define component integration surface and callback signatures.
- Location: `src/components/particles/IParticlesProps.ts`
- Contains: `id`, sizing, `options`/`url`, style/class props, `container` signal sink, `init` and `loaded` QRL callbacks.
- Depends on: `@builder.io/qwik` types and `@tsparticles/engine` types.
- Used by: Component implementation in `src/components/particles/particles.tsx` and barrel in `src/components/particles/index.ts`.

**Application/Render Entry Layer:**

- Purpose: Boot rendering contexts and provide runnable library example.
- Location: `src/entry.dev.tsx`, `src/entry.ssr.tsx`, `src/root.tsx`
- Contains: `render()` client entry, `renderToStream()` SSR entry, and demo page composition with `<Particles />`.
- Depends on: `src/root.tsx`, Qwik runtime/server modules, and tsParticles loader (`loadAll`) in `src/root.tsx`.
- Used by: Vite/Qwik dev and build commands from `package.json` scripts.

**Build Artifact Layer:**

- Purpose: Publishable JS and declaration outputs for consumers.
- Location: `lib/index.qwik.mjs`, `lib/index.qwik.cjs`, `lib-types/**/*.d.ts`
- Contains: Bundled runtime code and generated TypeScript declarations.
- Depends on: Source in `src/**` and build config in `vite.config.ts`/`tsconfig.json`.
- Used by: Package `main`/`qwik`/`types` fields in `package.json`.

## Data Flow

**Particles Initialization and Mount Flow:**

1. Consumer or demo root composes `<Particles />` and passes `init`, `options`, `id`, and optional callbacks in `src/root.tsx` or external consumer code through `src/index.ts`.
2. `Particles` in `src/components/particles/particles.tsx` derives effective config (`id`, `url`, `options`) and registers `useVisibleTask$` to run after visibility/hydration.
3. If `init` exists, `Particles` invokes the provided QRL callback (`InitFC(tsParticles)`) before load in `src/components/particles/particles.tsx`.
4. Component calls `tsParticles.load({ id, url, options })` in `src/components/particles/particles.tsx` to create a `Container` bound to the component canvas.
5. Container reference is propagated to caller via `props.container.value = noSerialize(container)` and optional `loaded(container)` callback in `src/components/particles/particles.tsx`.
6. Cleanup destroys the container in the task `cleanup()` to avoid leaks when component is removed in `src/components/particles/particles.tsx`.

**State Management:**

- Local, component-scoped state only via Qwik signals in `src/components/particles/particles.tsx` (`initSig`, `librarySig`).
- Non-serializable runtime objects use `NoSerialize`/`noSerialize` in `src/components/particles/particles.tsx` and typed in `src/components/particles/IParticlesProps.ts`.
- No shared global store/context is implemented in `src/**`.

## Key Abstractions

**Particles Component Abstraction:**

- Purpose: Declarative wrapper around imperative `tsParticles` engine lifecycle.
- Examples: `src/components/particles/particles.tsx`, `src/components/particles/index.ts`
- Pattern: Qwik component (`component$`) + visible task side-effect + explicit cleanup.

**Props Contract Abstraction:**

- Purpose: Separate declarative options/callback contract from rendering logic.
- Examples: `src/components/particles/IParticlesProps.ts`, `lib-types/components/particles/IParticlesProps.d.ts`
- Pattern: Interface-first API with optional callbacks and typed engine/container objects.

**Public Barrel Abstraction:**

- Purpose: Keep consumer imports stable and hide internal file layout.
- Examples: `src/index.ts`, `src/components/particles/index.ts`
- Pattern: Re-export only supported component and types from narrow entrypoints.

**Render Entry Abstraction:**

- Purpose: Separate client eager dev rendering from SSR streaming rendering.
- Examples: `src/entry.dev.tsx`, `src/entry.ssr.tsx`
- Pattern: Distinct Qwik entry functions (`render` vs `renderToStream`) with shared `Root`.

## Entry Points

**Package Entry:**

- Location: `src/index.ts`
- Triggers: Library imports from package consumers; Vite library build entry from `vite.config.ts`.
- Responsibilities: Re-export public components (`Particles`) only.

**SSR Entry:**

- Location: `src/entry.ssr.tsx`
- Triggers: Qwik SSR/build/start flows.
- Responsibilities: Stream `<Root />` with `@qwik-client-manifest` via `renderToStream()`.

**Dev Client Entry:**

- Location: `src/entry.dev.tsx`
- Triggers: `pnpm dev` and client-side development rendering.
- Responsibilities: Render `<Root />` into `document` through Qwik `render()`.

**Demo Root Composition:**

- Location: `src/root.tsx`
- Triggers: Called by both entry files.
- Responsibilities: Build page shell and instantiate `<Particles />` with `loadAll` initialization and sample options.

## Error Handling

**Strategy:** Fail-fast and delegate engine-level failures to runtime; perform lifecycle cleanup consistently.

**Patterns:**

- No local `try/catch` wrappers around `tsParticles.load()` in `src/components/particles/particles.tsx`; errors propagate to caller/runtime.
- Guarded task execution with early return on initialization flag in `src/components/particles/particles.tsx`.
- Deterministic teardown using `cleanup(() => container.destroy())` in `src/components/particles/particles.tsx`.

## Cross-Cutting Concerns

**Logging:** No explicit app logging in `src/**`; component code in `src/components/particles/particles.tsx` does not emit logs.

**Validation:** Minimal runtime validation; defaults are applied for `id` and options mapping (`options ?? params`) in `src/components/particles/particles.tsx`, with structural typing from `src/components/particles/IParticlesProps.ts`.

**Authentication:** Not applicable in this library package; no auth modules or middleware in `src/**`.

---

_Architecture analysis: 2026-04-10_
