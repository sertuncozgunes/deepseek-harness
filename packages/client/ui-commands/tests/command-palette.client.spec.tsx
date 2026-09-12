// @vitest-environment jsdom
/**
 * CommandPalette rendering + interaction spec, props-direct: opens on Meta/Ctrl+K,
 * filters by query, arrow/Enter navigation, and routes a picked command through
 * commandUi.insertCommandText with the pre-filled `/name ` line.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locales.ts'
import { CommandPalette } from '../src/client/CommandPalette.tsx'

const t = makeTranslate(zh, commonZh)

function mount(current: string | undefined) {
  const insertCommandText = vi.fn(() => true)
  const props = {
    t,
    commandUi: { insertCommandText },
    useSessions: (selector: (s: { current: string | undefined }) => string | undefined) => selector({ current }),
  }
  const Body = CommandPalette as unknown as (p: typeof props) => React.JSX.Element
  const view = render(createElement(Body, props))
  return { view, insertCommandText }
}

afterEach(() => { cleanup() })

describe('CommandPalette', () => {
  it('is closed by default and opens on Meta+K', () => {
    mount('s1')
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('lists the built-in commands and filters by query', () => {
    mount('s1')
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(screen.getByText('/goal')).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText('搜索命令…'), { target: { value: 'plan' } })
    expect(screen.getByText('/plan')).toBeTruthy()
    expect(screen.queryByText('/goal')).toBeNull()
  })

  it('routes a picked command through insertCommandText and closes', () => {
    const { insertCommandText } = mount('s1')
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(screen.getByText('/goal'))
    expect(insertCommandText).toHaveBeenCalledWith('s1', '/goal ')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Enter picks the highlighted row', () => {
    const { insertCommandText } = mount('s1')
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    const input = screen.getByPlaceholderText('搜索命令…')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(insertCommandText).toHaveBeenCalledWith('s1', '/goal ')
  })
})
