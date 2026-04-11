# Architecture Research

**Domain:** Framework wrapper modernization (Qwik wrapper over tsParticles v4 beta engine)
**Researched:** 2026-04-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                          Consumer / App Layer                             │
├────────────────────────────────────────────────────────────────────────────┤
│  App code           Loader init             Wrapper usage                 │
│  (Qwik routes)      (loadSlim/loadAll)      (<Particles ... />)          │
└───────────────┬───────────────┬───────────────────────────────┬──────────┘
                │               │                               │
┌───────────────▼───────────────▼───────────────────────────────▼──────────┐
│                         Wrapper Public API Layer                           │
├────────────────────────────────────────────────────────────────────────────┤
│  src/index.ts          src/components/particles/index.ts                   │
│  - stable exports      - public type aliases and component export          │
└───────────────┬───────────────────────────────────────────────┬───────────┘
                │                                               │
┌───────────────▼───────────────────────────────────────────────▼───────────┐
│                      Wrapper Runtime Adapter Layer                          │
├────────────────────────────────────────────────────────────────────────────┤
│  particles.tsx                                                            │
│  - normalize props                                                        │
│  - run init callback                                                      │
│  - call tsParticles.load()                                                │
│  - expose loaded callback + container signal                              │
│  - destroy on cleanup                                                     │
└───────────────┬───────────────────────────────────────────────┬───────────┘
                │                                               │
┌───────────────▼───────────────────────────────────────────────▼───────────┐
│                      Core Engine + Plugin Layer                            │
├────────────────────────────────────────────────────────────────────────────┤
│  @tsparticles/engine      @tsparticles/* plugin bundles                   │
│  - engine instance         - optional feature registration                 │
│  - container lifecycle     - slim/basic/full/all strategy                 │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component               | Responsibility                                               | Typical Implementation                                                                     |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Public export boundary  | Keep import surface stable while internals evolve            | `src/index.ts` + feature barrels only exporting supported symbols                          |
| Props contract boundary | Define versioned public API (types + deprecations)           | `IParticlesProps` with explicit compatibility notes and alias policy                       |
| Runtime adapter         | Translate declarative props into imperative engine lifecycle | Qwik component with one-shot init, callback ordering, idempotent cleanup                   |
| Engine bootstrap hook   | Register engine features once per app                        | Consumer-side init callback (`init(engine)`), wrapper never hardcodes heavy bundle loading |
| Compatibility gate      | Prevent unsafe upgrades in beta stream                       | Matrix checks across Qwik, engine, plugins, TS, Vite before merge/publish                  |
| Packaging boundary      | Preserve ESM/CJS/types contracts                             | Qwik library mode outputs + export-map verification from packed artifact                   |

## Recommended Project Structure

```text
src/
├── index.ts                              # package public API (stable contract)
├── components/
│   └── particles/
│       ├── particles.tsx                 # runtime adapter (Qwik -> tsParticles)
│       ├── IParticlesProps.ts            # public props contract
│       ├── contracts.ts                  # callback/order/version guards (new)
│       ├── normalize.ts                  # options/url/alias normalization (new)
│       └── index.ts                      # feature-level barrel
├── entry.dev.tsx                         # local app shell for verification
├── entry.ssr.tsx                         # SSR verification path
└── root.tsx                              # demo-only composition, not public API

tests/
├── contract/                             # public API + deprecation behavior
├── lifecycle/                            # init/load/cleanup ordering and idempotency
└── packaging/                            # tarball import/type smoke tests

.github/workflows/
└── nodejs.yml                            # matrix + package contract gates
```

### Structure Rationale

- **`src/index.ts` as permanent facade:** downstream imports stay stable while internals move.
- **`particles/` as adapter module:** all engine-touching behavior lives in one boundary, reducing regression blast radius.
- **`contracts.ts` + `normalize.ts` split:** keeps behavior rules explicit and testable instead of embedded in JSX lifecycle code.
- **`tests/` by contract area:** migration safety depends on behavior checks, not compile-only checks.
- **`root.tsx` treated as demo boundary:** avoids bleeding demo defaults into published wrapper behavior.

## Architectural Patterns

### Pattern 1: Stable Facade + Internal Adapter

**What:** Expose a narrow, semver-governed facade while isolating framework/engine churn behind one adapter component.
**When to use:** Always for wrappers over fast-moving core engines.
**Trade-offs:** Slight extra indirection, but much safer migrations and clearer break/no-break decisions.

**Example:**

```typescript
// src/index.ts
export { Particles } from "./components/particles";
export type { IParticlesProps, ParticlesProps } from "./components/particles";
```

### Pattern 2: Consumer-Driven Engine Bootstrap

**What:** Wrapper accepts init hook but does not force plugin bundle strategy (`all`, `full`, `slim`, custom).
**When to use:** When engine capabilities and bundle-size trade-offs vary per app.
**Trade-offs:** Consumers must pick/init feature set; wrapper stays lightweight and future-proof.

**Example:**

```typescript
// app-side usage
<Particles
  init={$(async (engine) => {
    await loadSlim(engine); // or loadAll/loadFull/custom
  })}
  options={options}
/>
```

### Pattern 3: Compatibility Matrix as Architecture Component

**What:** Treat version validation as a first-class boundary (not an ops afterthought).
**When to use:** Beta or rapidly evolving dependency families.
**Trade-offs:** Slower upgrade cadence, much lower downstream break risk.

**Example:**

```typescript
// pseudocode in CI matrix
for each set in compatibleSets:
  install(set)
  run(build, lifecycle-tests, packaging-smoke)
```

## Data Flow

### Request Flow

```text
[Consumer props + init callback]
    ↓
[Public API export]
    ↓
[Particles adapter]
    ↓ normalize(id/url/options/aliases)
[Engine init callback (consumer-owned)]
    ↓
[tsParticles.load()]
    ↓
[Container created]
    ↓
[loaded callback + container signal]
    ↓
[cleanup on unmount -> container.destroy() -> clear refs]
```

### State Management

```text
[Qwik local signals]
    ↓
[init state machine: idle -> initializing -> ready -> destroyed]
    ↓
[controls one-shot load + idempotent cleanup]
```

### Key Data Flows

1. **Initialization flow:** app passes init + options, adapter loads engine container once, emits loaded callback, stores non-serializable container safely.
2. **Teardown flow:** unmount triggers cleanup, adapter destroys container and clears internal/external references to prevent stale state.
3. **Upgrade validation flow:** dependency bump enters matrix pipeline, only promoted when lifecycle + packaging contract tests pass.

## Build Order (Dependency-Driven)

1. **Contract Baseline First**
   - Freeze current public API and behavior invariants (`options`/`params` precedence, callback order, cleanup semantics).
   - Required before any modernization so regressions are detectable.

2. **Compatibility and Toolchain Alignment**
   - Align Node/pnpm/CI and define tested dependency sets for Qwik + tsParticles beta packages.
   - Required before broad version bumps.

3. **Adapter Refactor Behind Existing Facade**
   - Introduce normalization and lifecycle state machine internally without changing public exports.
   - Depends on step 1 tests and step 2 matrix.

4. **Deprecation Path (Non-Breaking)**
   - Mark old aliases (for example `params`) as deprecated with warnings/documentation while keeping compatibility.
   - Depends on adapter stabilization from step 3.

5. **Packaging/Consumer Validation**
   - Validate packed artifact import/require/types from clean fixture apps.
   - Depends on finalized adapter and export-map correctness.

6. **Optional Breaking Cleanup (Next Major)**
   - Remove deprecated aliases and legacy branches only after one full minor deprecation window.
   - Depends on usage telemetry and communicated migration guide.

## Anti-Patterns

### Anti-Pattern 1: Demo-Driven Library Behavior

**What people do:** Bake demo defaults (`loadAll`) into wrapper runtime.
**Why it's wrong:** Bloats consumers and couples public library behavior to sample app choices.
**Do this instead:** Keep wrapper neutral; let consumer init choose bundle strategy.

### Anti-Pattern 2: Upgrade-Then-Test

**What people do:** Bump beta engine packages first, add tests later.
**Why it's wrong:** Regressions become ambiguous and expensive to isolate.
**Do this instead:** Establish lifecycle and contract tests first, then upgrade through matrix.

## Integration Points

### External Services

| Service                          | Integration Pattern                                     | Notes                                                               |
| -------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| `@tsparticles/engine`            | Direct runtime API call (`tsParticles.load`) in adapter | Core imperative boundary; wrap with deterministic lifecycle guards  |
| `@tsparticles/*` bundles/presets | Consumer-provided init registration                     | Keep choice outside wrapper for bundle-size and feature flexibility |
| Qwik runtime                     | `component$`, task lifecycle, `NoSerialize`             | Use browser-only task for DOM engine work and explicit cleanup      |

### Internal Boundaries

| Boundary                      | Communication             | Notes                                                  |
| ----------------------------- | ------------------------- | ------------------------------------------------------ |
| Public facade -> adapter      | Type-safe exports/imports | Public symbols should change rarely and intentionally  |
| Adapter -> core engine        | Function call boundary    | Normalize and validate inputs before crossing boundary |
| Adapter -> consumer callbacks | QRL callback invocation   | Preserve callback ordering and once-only guarantees    |
| CI matrix -> release process  | Gate/pipeline status      | No publish when matrix or packaging contracts fail     |

## Sources

- Project context and modernization scope: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/PROJECT.md`
- Current wrapper architecture and boundaries: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/codebase/ARCHITECTURE.md`
- Current integration behavior: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/codebase/INTEGRATIONS.md`
- Existing risks and migration pitfalls: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/codebase/CONCERNS.md`
- Current wrapper runtime implementation: `/Users/matteo/Projects/GitHub/tsparticles/qwik/src/components/particles/particles.tsx`
- Qwik library mode contracts and package/export expectations: https://qwik.dev/docs/advanced/library/
- Qwik task and visible task lifecycle semantics: https://qwik.dev/docs/core/tasks/
- tsParticles core docs and official wrapper ecosystem references: https://particles.js.org/docs/
- SemVer compatibility rules for public API evolution: https://semver.org/
- Official tsParticles wrapper usage patterns (consumer-owned init): https://github.com/tsparticles/react#readme
- Official tsParticles wrapper usage patterns (consumer-owned init): https://github.com/tsparticles/vue3#readme
- Official tsParticles wrapper usage patterns (SSR caveats and client-only patterns): https://github.com/tsparticles/svelte#readme

---

_Architecture research for: tsParticles Qwik wrapper modernization_
_Researched: 2026-04-10_
