/**
 * Two presets may both carry this row — the shipped `cordis` preset plus a
 * user copy of it — and the Host inspect registry is process-global while
 * rejecting a duplicate provider id. This spec mounts the plugin twice on one
 * process context (the real roster situation) and asserts the second mount
 * neither throws nor removes the shared registrations when it disposes.
 */
import { Context, type Fiber } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import type { HostCordisInspectProviderRegistration } from '@deepseek-ai/dsh-cordis-host-runner'
import { apply, inject } from '../src/index.ts'

interface StubProvider {
  readonly manifest: { readonly id: string }
}

const HOST_IDS = ['Service', 'Event', 'Builtin', 'Tool']

async function bench(): Promise<{
  ctx: Context
  providers: Map<string, StubProvider>
  mount: () => Promise<Fiber>
}> {
  const ctx = new Context()
  const providers = new Map<string, StubProvider>()
  ctx.provide('systemPrompt', { section: () => undefined, getSectionOrder: () => 0 } as never)
  ctx.provide('tools', { register: () => () => undefined, schemas: () => [] } as never)
  ctx.provide('dynamicCordisRunner', {} as never)
  ctx.provide('cordisInspect', {
    list: () => [...providers.values()].map(provider => ({ platform: 'host', ...provider.manifest })),
    register: (provider: HostCordisInspectProviderRegistration) => {
      const id = provider.manifest.id
      if (providers.has(id)) throw new Error(`Host Cordis inspect provider "${id}" is already registered`)
      providers.set(id, provider as StubProvider)
      return () => {
        if (providers.get(id) === provider) providers.delete(id)
      }
    },
    query: async () => undefined,
  } as never)
  return { ctx, providers, mount: async () => await ctx.plugin({ inject: [...inject], apply }).await() }
}

describe('tool-cordis inspect registration across preset mounts', () => {
  it('registers the four Host providers once and skips the duplicate mount', async () => {
    const b = await bench()
    const first = await b.mount()
    expect([...b.providers.keys()]).toEqual(HOST_IDS)

    const second = await b.mount()
    expect([...b.providers.keys()]).toEqual(HOST_IDS)

    // The second mount never owned the registrations, so its teardown keeps them.
    await second.dispose()
    expect([...b.providers.keys()]).toEqual(HOST_IDS)

    await first.dispose()
    expect([...b.providers.keys()]).toEqual([])
  })
})
