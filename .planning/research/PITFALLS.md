# Pitfalls Research

**Domain:** Framework wrapper modernization (Qwik wrapper over tsParticles v4 beta engine)
**Researched:** 2026-04-10
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Upgrading engine packages without a compatibility matrix

**What goes wrong:**
Wrapper deps are bumped to latest beta tags (`@tsparticles/*`) without validating cross-package compatibility, and the wrapper compiles but fails at runtime in init/load paths.

**Why it happens:**
Beta streams move quickly; maintainers treat version updates as independent package bumps instead of one tested version set.

**How to avoid:**
Define and maintain a compatibility matrix (Qwik version, `@tsparticles/engine`, `@tsparticles/all`, TS, Vite) and only merge upgrades that pass matrix scenarios.

**Warning signs:**

- Frequent "works locally, breaks in consumer app" reports after minor bumps
- Runtime-only errors around `tsParticles.load` or plugin/preset loading
- Repeated lockfile churn with no corresponding contract tests

**Phase to address:**
Phase 2 - Dependency Upgrade Matrix

---

### Pitfall 2: Refactoring lifecycle syntax while changing behavior unintentionally

**What goes wrong:**
Modernized Qwik syntax changes execution ordering in `useVisibleTask$`/signals, causing duplicate init, stale container references, or broken cleanup.

**Why it happens:**
Refactor scope mixes style changes with lifecycle rewrites in one pass, and there are no executable lifecycle tests.

**How to avoid:**
Separate "syntax-only" edits from "lifecycle logic" edits; add explicit init state guards (`idle/initializing/ready/destroyed`) and lifecycle contract tests before large refactors.

**Warning signs:**

- `loaded` callback fires multiple times or not at all
- Container exists after unmount, or re-mount triggers extra canvases
- Signal tracking changes in same PR as stylistic modernization

**Phase to address:**
Phase 1 - Baseline Contracts and Tests, then Phase 3 - Lifecycle Refactor

---

### Pitfall 3: Keeping deprecated API aliases forever (`params` vs `options`)

**What goes wrong:**
Legacy aliases remain undocumented or undeprecated, so consumers depend on both paths and modernization never reduces API complexity.

**Why it happens:**
Backward-compatibility fear leads to indefinite dual behavior without a removal plan.

**How to avoid:**
Publish a deprecation policy now: mark alias in types/docs, warn at runtime in dev, set removal target version, and add precedence tests for `options` + `params`.

**Warning signs:**

- New examples still use deprecated props
- Bug fixes must be duplicated across alias code paths
- Maintainer discussions repeatedly postpone alias removal

**Phase to address:**
Phase 1 - API Contract Definition

---

### Pitfall 4: Relying on build success as regression proof

**What goes wrong:**
CI greenlights only `build`, while behavioral regressions (init order, callback semantics, cleanup, URL/options precedence) ship in published package.

**Why it happens:**
Library modernization work focuses on tooling upgrades first; test infrastructure is postponed.

**How to avoid:**
Gate upgrades behind minimum tests: component lifecycle tests, prop contract tests, and publish-smoke tests against a fixture consumer app.

**Warning signs:**

- CI has no test job and no lint/type strictness ratchet
- Regressions are discovered only by downstream users
- "No code behavior changed" claims without test evidence

**Phase to address:**
Phase 1 - Quality Gates Foundation

---

### Pitfall 5: Treating wrapper and example app initialization as equivalent

**What goes wrong:**
Wrapper uses heavy demo defaults (`loadAll`) or assumes app-level init conventions, leading to unnecessary bundle cost and unclear consumer responsibilities.

**Why it happens:**
Modernization copies root/demo initialization patterns into library behavior.

**How to avoid:**
Keep wrapper core minimal and deterministic; document separate tracks for library defaults vs demo/full-feature setups, with explicit minimal init recipe.

**Warning signs:**

- Bundle size spikes after modernization even for simple use cases
- Consumer confusion about where plugin loading must happen
- Wrapper changes require demo app changes to keep working

**Phase to address:**
Phase 3 - Wrapper Boundary Hardening

---

### Pitfall 6: Ignoring package/export contract drift during tooling upgrades

**What goes wrong:**
ESM/CJS/types/exports drift after Vite/TS/package updates, causing broken imports or type resolution for downstream Qwik apps.

**Why it happens:**
Modernization validates only local dev/build, not real consumer import scenarios.

**How to avoid:**
Add release contract checks: verify `main`, `module`/`qwik`, `types`, and `exports` paths from a clean packed tarball in CI.

**Warning signs:**

- Consumer errors like "Cannot resolve entry" or missing declaration files
- Packaged files differ from `package.json` export map
- Local repo works, npm-installed package fails

**Phase to address:**
Phase 4 - Release and Consumer Compatibility Validation

---

### Pitfall 7: Toolchain skew across local/CI/release environments

**What goes wrong:**
Different pnpm/node/tool versions produce inconsistent lockfile resolution and behavior, so upgrade results are non-reproducible.

**Why it happens:**
`packageManager` pins one version while CI uses another; modernization updates deps without environment alignment.

**How to avoid:**
Align Node/pnpm versions across local and CI via Corepack and workflow pinning; fail CI on mismatched package manager version.

**Warning signs:**

- "Cannot reproduce" dependency issues between contributors and CI
- Frequent lockfile-only PR noise
- CI install behavior differs from local (peer resolution, hoisting)

**Phase to address:**
Phase 2 - Toolchain Alignment

## Technical Debt Patterns

| Shortcut                                                       | Immediate Benefit                 | Long-term Cost                                            | When Acceptable                              |
| -------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| Keep both `params` and `options` indefinitely                  | Avoids short-term breaking change | Permanent API ambiguity and duplicate maintenance         | Only with explicit deprecation timeline      |
| Merge dependency bumps + refactor + behavior changes in one PR | Faster apparent progress          | Root-cause isolation becomes very hard during regressions | Never for lifecycle-sensitive wrapper code   |
| Validate only local demo app                                   | Quick confidence signal           | Published package can still break in consumer installs    | Only as supplementary check, never sole gate |

## Integration Gotchas

| Integration                                  | Common Mistake                                               | Correct Approach                                                       |
| -------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Qwik lifecycle + tsParticles init            | Triggering init from tracked signals without one-shot guards | Use explicit initialization guards and idempotent cleanup              |
| tsParticles config loading (`url`/`options`) | Allowing ambiguous combinations with implicit precedence     | Define precedence contract, validate inputs, and test all combinations |
| Beta engine package family                   | Updating only one package and assuming compatibility         | Upgrade as a tested set with compatibility matrix and smoke tests      |

## Performance Traps

| Trap                                      | Symptoms                                 | Prevention                                                         | When It Breaks                                           |
| ----------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| Full bundle loader as default (`loadAll`) | Slow startup and larger consumer bundles | Provide minimal default init and document optional presets/plugins | Noticeable in multi-instance pages and mobile devices    |
| Duplicate container initialization        | Extra canvas instances, CPU/GPU spikes   | Guard init path; ensure cleanup resets internal and external refs  | Breaks quickly when components remount/re-render often   |
| Recreating options objects each render    | Frequent re-init/reload churn            | Normalize and memoize config boundary behavior                     | Becomes visible with dynamic props and multiple wrappers |

## Security Mistakes

| Mistake                                                     | Risk                                                    | Prevention                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| Passing untrusted `url` directly to loader                  | Uncontrolled client-side fetch to arbitrary origins     | Validate protocol/origin allowlist and document trusted-source expectation |
| Treating wrapper as "pure UI" and skipping input validation | Runtime failures or abuse via malformed config payloads | Add runtime validation/normalization for public props                      |

## "Looks Done But Isn't" Checklist

- [ ] **Dependency upgrade:** Matrix scenarios run (not just `pnpm build`) across targeted package set
- [ ] **Lifecycle refactor:** Tests confirm single init, correct callback order, and idempotent cleanup
- [ ] **API modernization:** Deprecated aliases marked, warned, and scheduled for removal
- [ ] **Release readiness:** Packed artifact import/type checks pass in a clean consumer fixture
- [ ] **Environment parity:** Node/pnpm versions match across local, CI, and release workflow

## Pitfall-to-Phase Mapping

| Pitfall                                              | Prevention Phase                     | Verification                                              |
| ---------------------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| Compatibility matrix missing for beta engine updates | Phase 2 - Dependency Upgrade Matrix  | Matrix CI job passes for pinned version set               |
| Lifecycle refactor changes behavior                  | Phase 1 + Phase 3                    | Lifecycle contract tests pass before/after refactor       |
| Deprecated alias bloat                               | Phase 1 - API Contract Definition    | Deprecation warnings and docs/tests are in place          |
| Build-only confidence                                | Phase 1 - Quality Gates Foundation   | CI requires tests + lint/type checks, not only build      |
| Wrapper/demo boundary bleed                          | Phase 3 - Wrapper Boundary Hardening | Minimal wrapper path works without demo-specific loaders  |
| Export/type contract drift                           | Phase 4 - Release Validation         | Tarball consumer smoke test validates imports and typings |
| Toolchain skew                                       | Phase 2 - Toolchain Alignment        | CI enforces same Node/pnpm versions as `packageManager`   |

## Sources

- Project context and constraints: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/PROJECT.md`
- Existing risk inventory: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/codebase/CONCERNS.md`
- Current testing gaps: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/codebase/TESTING.md`
- Integration boundaries: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/codebase/INTEGRATIONS.md`
- Current stack/toolchain versions: `/Users/matteo/Projects/GitHub/tsparticles/qwik/.planning/codebase/STACK.md`

---

_Pitfalls research for: tsParticles Qwik wrapper modernization_
_Researched: 2026-04-10_
