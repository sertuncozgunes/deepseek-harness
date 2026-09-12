// @vitest-environment jsdom
/** AgentNotesTab spec: renders the durable notes value, updates the draft on
 * typing, and writes back through the settings scope on blur. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locales.ts'
import { AgentNotesTab } from '../src/client/AgentNotesTab.tsx'

const t = makeTranslate(zh, commonZh)

function scope(initial: string) {
  let value = initial
  const listeners = new Set<() => void>()
  const set = vi.fn(async (_field: string, next: unknown) => {
    value = next as string
    for (const fn of [...listeners]) fn()
  })
  return {
    set,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } },
    getSnapshot: () => ({ value: { notes: value } }),
  }
}

function mount(notes: ReturnType<typeof scope>) {
  const props = { t, notes, useTabInfo: () => ({ tab: { title: 'x' } }) }
  const Body = AgentNotesTab as unknown as (p: typeof props) => React.JSX.Element
  return render(createElement(Body, props))
}

afterEach(() => { cleanup() })

describe('AgentNotesTab', () => {
  it('renders the durable notes value', () => {
    mount(scope('hello world'))
    expect(screen.getByDisplayValue('hello world')).toBeTruthy()
  })

  it('writes the draft back through the scope on blur', () => {
    const notes = scope('')
    mount(notes)
    const area = screen.getByPlaceholderText('在这里写下记忆…')
    fireEvent.change(area, { target: { value: 'new note' } })
    fireEvent.blur(area)
    expect(notes.set).toHaveBeenCalledWith('notes', 'new note')
  })
})
