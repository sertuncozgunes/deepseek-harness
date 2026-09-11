// @vitest-environment jsdom
/** Sidebar-foot theme quick-toggle wiring: the footer action registers once
 * the sidebar declares its slot, the injected face passes the theme service
 * plus a change subscription, copy rides the sidebar locale seat, and
 * clicking flips the resolved scheme with live re-render. */
import { Context, type Fiber } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the theme service/event merge for the stub's emit.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { apply, inject } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { ThemeToggle, type ThemeToggleInjected } from '../src/client/ThemeToggle.tsx'

// These specs assert the shipped Chinese copy (see apply.client.spec.tsx).

const owners = new Set<Fiber>()
afterEach(async () => {
  try {
    for (const owner of owners) await owner.dispose()
  } finally {
    owners.clear()
  }
})

function SidebarFrame({ renderSlot }: PropsRenderSlots<'sidebar'>) {
  return renderSlot('sidebar', { collapsed: false, width: 300 })
}

async function bench() {
  const root = new Context()
  let ctx: Context | undefined
  const owner = root.plugin((owned: Context) => { ctx = owned })
  owners.add(owner)
  await owner.await()
  if (ctx === undefined) throw new Error('the sidebar fixture owner did not activate')
  await ctx.plugin(SlotRegistry).await()
  const layout = { toggleSidebar: vi.fn(), selectPanel: vi.fn() }
  const uiWorkspace = { startSession: vi.fn() }
  const theme = {
    current: 'light',
    getTheme() {
      return { active: { id: this.current } }
    },
    setTheme(id: string) {
      this.current = id
      ctx!.emit('theme/change', this.getTheme() as never)
    },
  }
  ctx.provide('layout', layout)
  ctx.provide('uiWorkspace', uiWorkspace as never)
  ctx.provide('theme', theme as never)
  const locale = new LocaleRuntime(ctx)
  locale.setLocale('zh')
  ctx.provide('locale', locale)
  const slots = ctx.get('slots') as SlotRegistry
  slots.register(
    { name: 'root', children: {
      'sidebar': { kind: 'single', scope: 'root' },
      'main': { kind: 'keyed', scope: 'root' },
    } },
    SidebarFrame,
  )
  await ctx.plugin({ inject: [...inject], apply }).await()
  return { ctx, slots, locale, theme }
}

describe('ui-sidebar theme quick-toggle', () => {
  it('registers the footer action with the sidebar locale seat', async () => {
    const b = await bench()
    const entry = b.slots.entries('sidebar.footer.action').find(e => e.component === ThemeToggle)!
    expect(entry.options).toMatchObject({ id: 'theme-toggle', order: 10 })
    expect(entry.locale).toBe('sidebar')
  })

  it('flips the resolved scheme on click and keeps the label current', async () => {
    const b = await bench()
    const entry = b.slots.entries('sidebar.footer.action').find(e => e.component === ThemeToggle)!
    const face = (entry.inject as unknown as () => ThemeToggleInjected)()
    const t = b.locale.bind('sidebar')
    const view = render(<ThemeToggle theme={face.theme} subscribeTheme={face.subscribeTheme} t={t} wide={false} />)

    expect(screen.getByRole('button', { name: '切换到深色主题' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '切换到深色主题' }))
    expect(b.theme.current).toBe('dark')
    expect(await screen.findByRole('button', { name: '切换到浅色主题' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '切换到浅色主题' }))
    expect(b.theme.current).toBe('light')
    expect(await screen.findByRole('button', { name: '切换到深色主题' })).toBeTruthy()

    view.unmount()
  })
})
