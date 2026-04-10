# External Integrations

**Analysis Date:** 2026-04-10

## APIs & External Services

**UI Rendering / Animation Engine:**

- tsParticles - Browser particle system integration used by the Qwik component in `src/components/particles/particles.tsx` and initialized in `src/root.tsx`.
  - SDK/Client: `@tsparticles/engine` and `@tsparticles/all` (declared in `package.json`).
  - Auth: Not applicable (no credentials or API auth flow in source files).

**Source Configuration Loading:**

- Remote/local JSON configuration via tsParticles loader (`tsParticles.load({ url, id, options })`) in `src/components/particles/particles.tsx`.
  - SDK/Client: `@tsparticles/engine`.
  - Auth: Not detected in this package; URL is caller-provided through `IParticlesProps.url` in `src/components/particles/IParticlesProps.ts`.

## Data Storage

**Databases:**

- Not detected.
  - Connection: Not applicable.
  - Client: Not applicable.

**File Storage:**

- Local filesystem only for build artifacts and type declarations (`lib/`, `lib-types/`) configured by `vite.config.ts`, `tsconfig.json`, and `README.md`.

**Caching:**

- Nx local/remote-cache-capable build target caching configured in `nx.json` (`targetDefaults.build.cache`, `build:ci.cache`).

## Authentication & Identity

**Auth Provider:**

- Not applicable.
  - Implementation: No authentication layer present in `src/**/*.ts*`, `vite.config.ts`, or workflow configuration.

## Monitoring & Observability

**Error Tracking:**

- None detected (no Sentry/Bugsnag/Rollbar dependencies in `package.json`).

**Logs:**

- Minimal/no explicit logging in library source; console logging is allowed by lint config (`.eslintrc.cjs` sets `no-console: off`).

## CI/CD & Deployment

**Hosting:**

- GitHub repository with GitHub Actions CI (`.github/workflows/nodejs.yml`).
- Package distribution target (library outputs declared in `package.json` `main`, `qwik`, `types`, `exports`, and `files`).

**CI Pipeline:**

- GitHub Actions workflow `Node.js CI` in `.github/workflows/nodejs.yml`:
  - checkout via `actions/checkout@v4`
  - Node setup via `actions/setup-node@v4` (Node 20)
  - pnpm setup via `pnpm/action-setup@v3.0.0`
  - install + build (`pnpm install`, `pnpm run build:ci`)

## Environment Configuration

**Required env vars:**

- Not detected for runtime or build in this package.

**Secrets location:**

- Not applicable for this package’s code path.
- `.env` files are not present in repository root/subdirectories.

## Webhooks & Callbacks

**Incoming:**

- None detected (no HTTP server/webhook endpoint implementation in `src/**/*.ts*`).

**Outgoing:**

- None detected from package code.
- GitHub Actions receives repository event triggers (`push`, `pull_request`) in `.github/workflows/nodejs.yml`, but no custom outbound webhook clients are implemented in source.

---

_Integration audit: 2026-04-10_
