/** Global keyboard-shortcuts help: a frame-wide overlay opened by `Meta+/`
 * (Cmd+/ or Ctrl+/), listing the shortcuts the composer, slash menu, and
 * command palette actually use. Press the same chord or Escape to close. */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { CommandKey } from './locales.ts'
import css from './ShortcutHelp.module.css'

/** The fixed shortcut table (localized labels ride `t`, chords are static). */
const CHORDS: ReadonlyArray<{ labelKey: CommandKey; chord: string }> = [
  { labelKey: 'help.row.openPalette', chord: '⌘ K' },
  { labelKey: 'help.row.openHelp', chord: '⌘ /' },
  { labelKey: 'help.row.navigate', chord: '↑ / ↓' },
  { labelKey: 'help.row.pick', chord: 'Enter' },
  { labelKey: 'help.row.drill', chord: 'Tab' },
  { labelKey: 'help.row.closeMenu', chord: 'Esc' },
]

/** Palette props: locale seat only (the overlay slot supplies nothing else it needs). */
export interface ShortcutHelpProps extends PropsLocale<'command'> {}

/**
 * Render the shortcuts help overlay. Open state is owned here; the chord
 * toggles it and Escape closes it.
 */
export function ShortcutHelp({ t }: ShortcutHelpProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => { setOpen(false) }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
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

  if (!open) return null

  return (
    <div className={css.root} role="dialog" aria-modal="true" aria-label={t('help.title')}>
      <div className={css.mask} aria-hidden="true" onClick={close} />
      <div ref={panelRef} className={css.panel}>
        <div className={css.title}>{t('help.title')}</div>
        <ul className={css.list}>
          {CHORDS.map(row => (
            <li key={row.labelKey} className={css.row}>
              <span className={css.label}>{t(row.labelKey)}</span>
              <kbd className={css.chord}>{row.chord}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
