/** Global ⌘K command palette: a frame-wide overlay opened by Meta/Ctrl+K that
 * lists the built-in slash commands, filters as you type, and on pick routes a
 * pre-filled `/command ` back into the active session's composer through
 * `commandUi.insertCommandText` — execution stays in the existing slash
 * pipeline. Owned by ui-commands and registered on the root `shell.overlay`. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconSearchOutline16, IconSendOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { CommandUiContract } from './contract.ts'
import css from './CommandPalette.module.css'

/** The built-in command names the palette surfaces (the same set the / menu owns). */
const BUILTIN_NAMES = ['goal', 'plan', 'feedback', 'compact', 'permission', 'export'] as const

/** The palette's injected face: the command service plus the global session idiom. */
export interface CommandPaletteProps extends PropsLocale<'command'> {
  commandUi: Pick<CommandUiContract, 'insertCommandText'>
  useSessions: (selector: (s: { current: SessionId | undefined }) => SessionId | undefined) => SessionId | undefined
}

/**
 * Render the global ⌘K palette (mounted once at the root overlay; it owns its
 * open/query/highlight state and the document-level key listener).
 */
export function CommandPalette({ t, commandUi, useSessions }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const rows = useMemo(() => BUILTIN_NAMES.map(name => ({
    name,
    label: t(`label.${name}`),
    description: t(`description.${name}`),
  })), [t])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return rows
    return rows.filter(r => r.name.toLowerCase().includes(q) || r.label.toLowerCase().includes(q))
  }, [rows, query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setHighlight(0)
  }, [])

  // Global Meta/Ctrl+K toggle; Escape closes. Guarded on `open` so the Escape
  // branch re-subscribes after every open/close without leaking space hotkeys.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const pick = useCallback((name: string) => {
    const sessionId = useSessions(s => s.current)
    if (sessionId !== undefined) commandUi.insertCommandText(sessionId, `/${name} `)
    close()
  }, [commandUi, useSessions, close])

  if (!open) return null

  return (
    <div className={css.root} role="dialog" aria-modal="true" aria-label={t('palette.title')}>
      <div className={css.mask} aria-hidden="true" onClick={close} />
      <div className={css.panel}>
        <div className={css.search}>
          <IconSearchOutline16 className={css.searchIcon} />
          <input
            ref={inputRef}
            className={css.input}
            placeholder={t('palette.placeholder')}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlight(0) }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)) }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
              else if (e.key === 'Enter') { e.preventDefault(); const row = filtered[highlight]; if (row !== undefined) pick(row.name) }
            }}
          />
        </div>
        <ul className={css.list} role="listbox">
          {filtered.length === 0
            ? <li className={css.emptyRow}>{t('palette.empty')}</li>
            : filtered.map((row, index) => (
              <li
                key={row.name}
                role="option"
                aria-selected={index === highlight}
                className={index === highlight ? `${css.row} ${css.rowActive}` : css.row}
                onMouseEnter={() => { setHighlight(index) }}
                onClick={() => { pick(row.name) }}
              >
                <IconSendOutline16 className={css.rowIcon} />
                <span className={css.rowLabel}>/{row.name}</span>
                <span className={css.rowDescription}>{row.description}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
