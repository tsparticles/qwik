# tsParticles Qwik v4 Modernization

## What This Is

This project modernizes the existing `@tsparticles/qwik` integration library for the tsParticles v4 generation. It keeps the library focused and lightweight for Qwik users while upgrading dependencies, APIs, and code patterns to current standards. The main users are maintainers and downstream Qwik projects that need a stable, up-to-date particles wrapper.

## Core Value

Deliver a reliable, modern Qwik wrapper that fully supports current tsParticles v4 beta packages with clean, forward-compatible syntax.

## Requirements

### Validated

- ✓ Qwik component wrapper initializes and renders tsParticles containers from declarative props — existing
- ✓ Library is publishable as ES/CJS + TypeScript declarations from `src/index.ts` — existing
- ✓ SSR/dev entrypoints are wired for Qwik runtime and local verification flows — existing

### Active

- [ ] Upgrade all project dependencies and tooling to latest compatible versions, prioritizing tsParticles v4 beta packages under active development.
- [ ] Migrate component and library code to modern, consistent syntax and patterns while preserving behavior and API clarity.
- [ ] Maintain build correctness, package exports, and consumer compatibility after modernization.

### Out of Scope

- New product features unrelated to modernization (new UI capabilities, major API expansion) — objective is update and migration first
- Rewriting the wrapper into a different framework or architecture — would delay v4 alignment and increase risk

## Context

This repository is an existing brownfield codebase with a completed codebase map in `.planning/codebase/`. It already ships a Qwik-based tsParticles wrapper and currently references tsParticles 4.0.0 beta packages. The immediate project goal is to update everything to the latest versions and migrate to more modern syntax conventions without destabilizing the wrapper.

## Constraints

- **Tech stack**: Keep Qwik + tsParticles wrapper architecture — existing package purpose must remain intact
- **Compatibility**: Continue supporting tsParticles v4 beta development stream — maintain alignment with ongoing package work
- **Quality bar**: Avoid behavioral regressions during modernization — existing consumers depend on stable wrapper behavior

## Key Decisions

| Decision                                                   | Rationale                                                           | Outcome   |
| ---------------------------------------------------------- | ------------------------------------------------------------------- | --------- |
| Prioritize modernization before feature expansion          | User's first objective is dependency and syntax upgrade             | — Pending |
| Treat this as brownfield evolution, not greenfield rebuild | Existing validated wrapper capabilities already in production shape | — Pending |
| Keep tsParticles v4 beta line as primary target            | User is actively developing the 4.0.0 beta ecosystem                | — Pending |

---

_Last updated: 2026-04-10 after initialization_
