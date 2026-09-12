// @vitest-environment jsdom
/** ShortcutHelp spec: opens on Meta+/, lists the shortcut rows localized, and
 * closes on Escape. */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locales.ts'
import { ShortcutHelp } from '../src/client/ShortcutHelp.tsx'

const t = makeTranslate(zh, commonZh)

function mount() {
  const props = { t }
  const Body = ShortcutHelp as unknown as (p: typeof props) => React.JSX.Element
  const view = render(createElement(Body, props))
  return view
}

afterEach(() => { cleanup() })

describe('ShortcutHelp', () => {
  it('opens on Meta+/ and lists the shortcuts', () => {
    mount()
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.keyDown(document, { key: '/', metaKey: true })
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('键盘快捷键')).toBeTruthy()
    expect(screen.getByText('打开命令面板')).toBeTruthy()
  })

  it('closes on Escape', () => {
    mount()
    fireEvent.keyDown(document, { key: '/', metaKey: true })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
