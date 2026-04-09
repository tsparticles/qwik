# Qwik ParticlesContext Pattern

## Overview

Qwik uses **fine-grained reactivity** with signals and context providers. The centralized engine pattern leverages Qwik's
`useContext` and lazy loading capabilities.

### Key Features
- **Signals**: Reactive engine state with `Signal`
- **Context**: Application-level provider with `createContextId`
- **Lazy Loading**: Code is lazy-loaded with Qwik's serialization
- **SSR-Safe**: Works seamlessly with Qwik's resumability

## Setup

### 1. Create Context and Store

```typescript
// src/lib/particles/context.ts
import { createContextId, Signal, signal } from "@builder.io/qwik";
import type { Engine } from "@tsparticles/engine";

export const ParticlesContextId = createContextId<ParticlesContext>(
  "particles.context"
);

export interface ParticlesContext {
  engine: Signal<Engine | undefined>;
  isReady: Signal<boolean>;
  error: Signal<Error | undefined>;
  initialize: (fn?: (engine: Engine) => Promise<void>) => Promise<void>;
}

// Singleton instance
let instance: Promise<ParticlesContext> | undefined;

export const getParticlesContext = async (
  particlesInit?: (engine: Engine) => Promise<void>
): Promise<ParticlesContext> => {
  if (instance) return instance;

  instance = (async () => {
    const engine = signal<Engine | undefined>(undefined);
    const isReady = signal(false);
    const error = signal<Error | undefined>(undefined);

    const initialize = async () => {
      try {
        const { tsParticles } = await import("@tsparticles/engine");

        if (particlesInit) {
          await particlesInit(tsParticles);
        }

        engine.value = tsParticles;
        isReady.value = true;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        error.value = e;
        isReady.value = true;
        throw e;
      }
    };

    return {
      engine,
      isReady,
      error,
      initialize,
    };
  })();

  return instance;
};
```

### 2. Provider Component

```typescript
// src/components/particles-provider.tsx
import { component$, useContextProvider } from "@builder.io/qwik";
import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { ParticlesContextId, getParticlesContext } from "~/lib/particles/context";
import type { Engine } from "@tsparticles/engine";

interface ParticlesProviderProps extends QwikIntrinsicElements["div"] {
  particlesInit?: (engine: Engine) => Promise<void>;
}

export const ParticlesProvider = component$<ParticlesProviderProps>(
  ({ particlesInit, ...props }, key) => {
    const context = getParticlesContext(particlesInit);
    useContextProvider(ParticlesContextId, context);

    return <div {...props}></div>;
  }
);
```

### 3. Consumer Hook

```typescript
// src/lib/particles/use-particles.ts
import { useContext, useTask$ } from "@builder.io/qwik";
import { ParticlesContextId } from "./context";

export const useParticles = () => {
  const context = useContext(ParticlesContextId);

  useTask$(async () => {
    if (!context.isReady.value) {
      await context.initialize();
    }
  });

  return context;
};
```

## Usage Examples

### App Layout with Provider

```typescript
// src/routes/layout.tsx
import { component$, Slot } from "@builder.io/qwik";
import { ParticlesProvider } from "~/components/particles-provider";
import { loadFull } from "@tsparticles/presets";

export default component$(() => {
  return (
    <ParticlesProvider
      particlesInit={loadFull}
      class="root-layout"
    >
      <main>
        <Slot />
      </main>
    </ParticlesProvider>
  );
});
```

### Component Using Particles

```typescript
// src/components/particles-bg.tsx
import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { useParticles } from "~/lib/particles/use-particles";
import type { Container } from "@tsparticles/engine";

export const ParticlesBg = component$(() => {
  const particles = useParticles();
  const container = useSignal<Container>();

  useTask$(async () => {
    if (particles.isReady.value && particles.engine.value) {
      const { Container } = await import("@tsparticles/engine");
      const cont = await particles.engine.value!.load({
        id: "bg-particles",
        options: {
          particles: {
            number: { value: 100 },
            shape: { type: "circle" },
            move: { speed: 2 },
          },
        },
      });
      container.value = cont;
    }
  });

  return (
    <div id="bg-particles" class="particles-container">
      {particles.error.value && (
        <div class="error-message">
          {particles.error.value.message}
        </div>
      )}
      {!particles.isReady.value && (
        <div class="loading">Loading particles...</div>
      )}
    </div>
  );
});
```

### Page with Multiple Particles

```typescript
// src/routes/index.tsx
import { component$ } from "@builder.io/qwik";
import { ParticlesBg } from "~/components/particles-bg";
import { ParticlesAccent } from "~/components/particles-accent";

export default component$(() => {
  return (
    <div class="home">
      <ParticlesBg />
      <section class="hero">
        <h1>Welcome</h1>
        <ParticlesAccent />
      </section>
    </div>
  );
});
```

## Advanced Patterns

### Conditional Initialization

```typescript
// src/lib/particles/lazy-init.ts
import {
  signal,
  useTask$,
  useContext,
} from "@builder.io/qwik";
import { ParticlesContextId } from "./context";

export const useLazyParticles = () => {
  const context = useContext(ParticlesContextId);
  const shouldInit = signal(false);

  useTask$(async () => {
    if (shouldInit.value && !context.isReady.value) {
      await context.initialize();
    }
  });

  return {
    ...context,
    shouldInit,
  };
};
```

### Custom Presets per Environment

```typescript
// src/lib/particles/config.ts
import { isDev } from "@builder.io/qwik/build";
import type { Engine } from "@tsparticles/engine";

export const initParticlesForEnv = async (engine: Engine) => {
  if (isDev) {
    const { loadConfetti } = await import("@tsparticles/presets");
    return loadConfetti(engine);
  } else {
    const { loadFull } = await import("@tsparticles/presets");
    return loadFull(engine);
  }
};
```

Usage:
```typescript
<ParticlesProvider particlesInit={initParticlesForEnv}>
  ...
</ParticlesProvider>
```

## Full Application Example

```typescript
// src/root.tsx
import { component$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { ParticlesProvider } from "./components/particles-provider";
import { loadFull } from "@tsparticles/presets";

import "./global.css";

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <ParticlesProvider particlesInit={loadFull}>
          <RouterOutlet />
        </ParticlesProvider>
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
```

```typescript
// src/routes/index.tsx
import { component$ } from "@builder.io/qwik";
import { ParticlesBg } from "~/components/particles-bg";
import { Hero } from "~/components/hero";
import { Features } from "~/components/features";

export default component$(() => {
  return (
    <>
      <ParticlesBg />
      <Hero />
      <Features />
    </>
  );
});
```

## Performance Characteristics

| Metric | Impact |
|--------|--------|
| Initial JS | Only loader downloaded |
| Engine load delay | First particle component triggers |
| Memory per page | Shared across all instances |
| Resumability | Fully supported |

## Qwik-Specific Considerations

### 1. Serialization

Qwik serializes component state automatically. Ensure Engine is not serialized:

```typescript
// Safe: Engine initialized in useTask$, not serialized
useTask$(async () => {
  const particles = useParticles();
  // particles.engine is a Signal<Engine>, lazily initialized
});

// Avoid: Don't embed Engine directly in component state
const unsafe = {
  engine: tsParticles, // ✗ Not serializable
};
```

### 2. Lazy Chunk Loading

Each component chunk loads independently:

```typescript
// src/components/lazy-particles.tsx
export const LazyParticles = component$(() => {
  // This component's code only loads when needed
  const particles = useParticles();
  return <div>{particles.isReady.value && "Ready!"}</div>;
});
```

### 3. Building with Qwik City

Ensure build includes dynamic imports:

```jsonc
// vite.config.ts
import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizers/vite";

export default defineConfig({
  plugins: [qwikVite()],
  // Supports dynamic imports in signals
});
```

## Testing in Qwik

```typescript
// src/lib/particles/__tests__/context.spec.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getParticlesContext } from "../context";

describe("ParticlesContext", () => {
  beforeEach(() => {
    // Reset singleton
    globalThis.tsParticlesInstance = undefined;
  });

  it("initializes engine on demand", async () => {
    const context = await getParticlesContext();
    await context.initialize();

    expect(context.isReady.value).toBe(true);
    expect(context.engine.value).toBeDefined();
  });

  it("returns same instance", async () => {
    const ctx1 = getParticlesContext();
    const ctx2 = getParticlesContext();

    expect(ctx1).toBe(ctx2);
  });
});
```

## Troubleshooting

### Context not available in deeply nested component

**Issue:** Qwik context providers have limited scope

**Fix:** Ensure provider wraps all consumers:
```typescript
// ✓ Correct
<ParticlesProvider>
  <Layout>
    <Page>
      <DeepComponent /> {/* Can use useParticles() */}
    </Page>
  </Layout>
</ParticlesProvider>

// ✗ Wrong
<DeepComponent /> {/* Would fail */}
<ParticlesProvider>...</ParticlesProvider>
```

### Signal updates not triggering re-render

**Issue:** useTask$ not detecting signal changes

**Pattern:**
```typescript
useTask$(({ track }) => {
  track(() => particles.isReady.value);
  // ... runs when isReady changes
});
```

## Qwik-Specific Advantages

1. **Resumability**: App state preserved across serialization boundaries
2. **Fine-grained reactivity**: Only changed signals trigger re-renders
3. **Lazy loading**: Framework code loads only as needed
4. **Streaming SSR**: Particles can be fetched incrementally
