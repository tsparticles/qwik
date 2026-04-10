# Codebase Concerns

**Analysis Date:** 2026-04-10

## Tech Debt

**Type safety guardrails relaxed globally:**

- Issue: Lint rules disable multiple TypeScript safety checks, making it easier to introduce runtime bugs and weak public API typing in a library package.
- Files: `.eslintrc.cjs`, `package.json`
- Impact: Regressions can pass lint and ship to consumers of `qwik-particles` with fewer early warnings.
- Fix approach: Re-enable high-value rules incrementally (`@typescript-eslint/no-explicit-any`, `@typescript-eslint/explicit-module-boundary-types`, `@typescript-eslint/ban-ts-comment`) and enforce in CI before publish.

**Legacy/deprecated prop alias retained (`params`):**

- Issue: `params` is accepted as an alias for `options`, increasing API surface and ambiguity.
- Files: `src/components/particles/IParticlesProps.ts`, `src/components/particles/particles.tsx`
- Impact: Future maintenance requires dual-path compatibility and docs/support overhead.
- Fix approach: Deprecate `params` in docs and types, emit runtime warning when used, remove in next major version.

## Known Bugs

**Potential duplicate initialization in reactive task:**

- Symptoms: The particles container can be loaded more than once under signal-driven reruns, potentially causing duplicated work and inconsistent container lifecycle.
- Files: `src/components/particles/particles.tsx`
- Trigger: `useVisibleTask$` tracks `initSig.value`, then `initParticles()` mutates `initSig.value = true` and also calls `loadParticles()` directly.
- Workaround: Treat task as one-shot initialization (remove tracked signal dependency for this flow, or guard with explicit `initialized` flag before calling `tsParticles.load`).

**Container signal can retain destroyed instance reference:**

- Symptoms: Consumer code reading `props.container.value` may observe a stale container after unmount.
- Files: `src/components/particles/particles.tsx`, `src/components/particles/IParticlesProps.ts`
- Trigger: Cleanup clears `librarySig.value` only; it does not reset `props.container.value`.
- Workaround: Reset both internal and external container signals during cleanup.

## Security Considerations

**Untrusted remote config URL path:**

- Risk: Passing user-controlled `url` into `tsParticles.load` can trigger client-side fetches to arbitrary origins.
- Files: `src/components/particles/particles.tsx`, `src/components/particles/IParticlesProps.ts`
- Current mitigation: Not detected.
- Recommendations: Restrict allowed origins/protocols for `url`, validate input before passing to engine, and document safe usage expectations for library consumers.

**Secrets handling posture:**

- Risk: Not detected in source code; no secret-bearing files are required by project runtime.
- Files: `.gitignore`, `README.md`, `package.json`
- Current mitigation: Repository ignores common build/cache artifacts; no `.env` contract defined in public docs.
- Recommendations: Keep secret files explicitly ignored and add a short security note in `README.md` for downstream app integrators.

## Performance Bottlenecks

**Heavy default example initialization path:**

- Problem: The sample root loads full tsParticles bundle (`loadAll`), which maximizes features but increases initialization cost.
- Files: `src/root.tsx`
- Cause: `@tsparticles/all` is used directly in init callback.
- Improvement path: Prefer scoped presets/plugins for production examples and document minimal setup alternatives.

**Re-initialization risk from task flow:**

- Problem: Initialization logic can execute redundantly, increasing CPU/memory work.
- Files: `src/components/particles/particles.tsx`
- Cause: Signal-tracked task combined with direct invocation path.
- Improvement path: Convert to guarded one-time init path and avoid dependency tracking that retriggers setup.

## Fragile Areas

**Lifecycle + async setup in single component:**

- Files: `src/components/particles/particles.tsx`
- Why fragile: Rendering, async initialization, external callbacks (`init`, `loaded`), and cleanup are tightly coupled; small edits can break lifecycle ordering.
- Safe modification: Add explicit state machine flags (`idle`/`initializing`/`ready`/`destroyed`) and keep cleanup idempotent.
- Test coverage: No tests detected for this component (`**/*.test.*` and `**/*.spec.*` not present).

**Public API concentrated in minimal type file:**

- Files: `src/components/particles/IParticlesProps.ts`, `src/index.ts`
- Why fragile: Public API is defined by a small interface without runtime validation.
- Safe modification: Add validation/normalization at component boundary and assert incompatible combinations (`url` + `options`) explicitly.
- Test coverage: No contract tests detected for exported types/components.

## Scaling Limits

**Multiple particle instances per page:**

- Current capacity: Not explicitly bounded in code.
- Limit: Each component instance creates/owns a container and canvas, which scales CPU/GPU usage with instance count.
- Scaling path: Document recommended upper bounds per page, expose lightweight presets, and encourage shared/global engine initialization patterns.

## Dependencies at Risk

**Beta particle engine dependencies:**

- Risk: Library depends on beta versions of core engine packages.
- Impact: Upstream beta API/behavior changes can introduce breaking behavior into published package.
- Migration plan: Track stable `@tsparticles/*` releases, pin exact compatible versions, and add compatibility tests before upgrade.
- Files: `package.json`

**Toolchain version drift in CI:**

- Risk: CI installs pnpm 8 while package metadata declares pnpm 10; reproducibility risk across local/CI/release flows.
- Impact: Lockfile and install behavior differences can cause non-reproducible builds.
- Migration plan: Align `.github/workflows/nodejs.yml` pnpm version with `package.json#packageManager` and enforce via corepack.
- Files: `.github/workflows/nodejs.yml`, `package.json`, `pnpm-lock.yaml`

## Missing Critical Features

**No automated test suite for published component:**

- Problem: No unit/integration tests exist for initialization, callback behavior, cleanup, or prop combinations.
- Blocks: Safe refactors in `src/components/particles/particles.tsx` and confident dependency upgrades.

**No CI quality gates beyond build:**

- Problem: CI only runs build and does not enforce lint/test checks.
- Blocks: Early detection of regressions and API behavior drift.
- Files: `.github/workflows/nodejs.yml`, `package.json`

## Test Coverage Gaps

**Component lifecycle and callback contracts untested:**

- What's not tested: `init` ordering, `loaded` callback invocation, cleanup behavior, container signal handling.
- Files: `src/components/particles/particles.tsx`, `src/components/particles/IParticlesProps.ts`
- Risk: Regressions in mount/unmount or callback sequencing can ship unnoticed.
- Priority: High

**Configuration-path behavior untested:**

- What's not tested: `options` vs `params` precedence, `url`-only mode, invalid/missing configuration handling.
- Files: `src/components/particles/particles.tsx`
- Risk: Consumers hit runtime failures with ambiguous inputs.
- Priority: High

**Repository integration quality checks untested in CI:**

- What's not tested: lint execution and any test execution in CI workflow.
- Files: `.github/workflows/nodejs.yml`, `package.json`, `.eslintrc.cjs`
- Risk: Quality regressions merge without automated feedback.
- Priority: Medium

---

_Concerns audit: 2026-04-10_
