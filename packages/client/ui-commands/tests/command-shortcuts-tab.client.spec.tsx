// @vitest-environment jsdom
/**
 * CommandShortcutsTab rendering spec, props-direct: the empty state when
 * neither scope carries names, then the favorites and recent sections once
 * the scopes serve values, and the unpin affordance writing the durable
 * favorites scope.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locales.ts'
import { CommandShortcutsTab } from '../src/client/CommandShortcutsTab.tsx'

const t = makeTranslate(zh, commonZh)

/** Minimal settings-scope fake: a value plus a synchronous notify on write. */
function scope<T>(initial: T | undefined) {
  let value = initial
  const listeners = new Set<() => void>()
  const set = vi.fn(async (_field: string, next: unknown) => {
    value = next as T | undefined
    for (const fn of [...listeners]) fn()
  })
  return {
    set,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } },
    getSnapshot: () => ({ value: value as T | undefined }),
  }
}

function mount(favoritesValue: { favorites?: string[] } | undefined, recentValue: { recent?: string[] } | undefined) {
  const favorites = scope(favoritesValue)
  const recent = scope(recentValue)
  const props = {
    t,
    favorites,
    recent,
    useTabInfo: () => ({ tab: { title: 'x' } }),
  }
  const Body = CommandShortcutsTab as unknown as (p: typeof props) => React.JSX.Element
  const view = render(createElement(Body, props))
  return { view, favorites }
}

describe('CommandShortcutsTab', () => {
  afterEach(() => { cleanup() })

  it('shows the empty state when neither scope carries names', () => {
    mount(undefined, undefined)
    expect(screen.getByText('还没有收藏或最近使用的命令。在输入框中使用 / 命令后会出现在这里。')).toBeTruthy()
  })

  it('renders favorites and recent sections from the scopes', () => {
    mount({ favorites: ['plan', 'goal'] }, { recent: ['plan', 'deploy'] })
    expect(screen.getByText('收藏')).toBeTruthy()
    expect(screen.getByText('最近使用')).toBeTruthy()
    // '/plan' appears in both sections (pinned and recent); keep both names
    // present without assuming a single occurrence.
    expect(screen.getAllByText('/plan').length).toBe(2)
    expect(screen.getByText('/goal')).toBeTruthy()
    expect(screen.getByText('/deploy')).toBeTruthy()
  })

  it('drops the favorites section when there are no pinned commands', () => {
    mount(undefined, { recent: ['plan'] })
    expect(screen.queryByText('收藏')).toBeNull()
    expect(screen.getByText('最近使用')).toBeTruthy()
  })

  it('unpinning a favorite writes the durable scope without that name', () => {
    const { favorites } = mount({ favorites: ['plan', 'goal'] }, undefined)
    const buttons = screen.getAllByRole('button')
    // First button is the 'plan' row's unpin affordance.
    fireEvent.click(buttons[0]!)
    expect(favorites.set).toHaveBeenCalledWith('favorites', ['goal'])
  })
})
