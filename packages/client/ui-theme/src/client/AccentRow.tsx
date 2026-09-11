/** Accent-color preference row registered into the General section item
 * slot: title + one swatch per accent. Registered by this package — the
 * theme feature owns its own settings surface. The selected swatch reflects
 * the persisted accent, never the resolved active theme. */
import clsx from 'clsx'
import type { CSSProperties } from 'react'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { AccentId } from '../theme-settings.ts'
import type { ThemeKey } from './locales.ts'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { createAccentRowStore } from './settings-store.ts'
import css from './AccentRow.module.css'

/** Injected business face: the accent write (t rides the standard locale seat). */
export interface AccentRowInjected {
  /** Switch the accent color. */
  setAccent: (id: AccentId) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type AccentRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createAccentRowStore>>
  & PropsLocale<'settings.theme'> & AccentRowInjected

/** Swatch order, preview values, and locale keys. */
const SWATCHES: readonly { id: AccentId; labelKey: ThemeKey; swatch?: string }[] = [
  { id: 'default', labelKey: 'accent.default' },
  { id: 'blue', labelKey: 'accent.blue', swatch: 'var(--dsw-static-blue-600)' },
  { id: 'deepseek', labelKey: 'accent.deepseek', swatch: 'var(--dsw-static-deepseek-600)' },
  { id: 'red', labelKey: 'accent.red', swatch: 'var(--dsw-static-red-600)' },
]

/**
 * Render the Accent row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function AccentRow({ t, setAccent, useStore }: AccentRowComponentProps) {
  const accent = useStore(s => s.accent)
  return (
    <div className={css.group}>
      <div className={css.title}>{t('accent.title')}</div>
      <div className={css.swatchRow}>
        {SWATCHES.map(({ id, labelKey, swatch }) => (
          <button
            key={id}
            type="button"
            className={clsx(css.swatch, accent === id && css.selected)}
            aria-pressed={accent === id}
            aria-label={t(labelKey)}
            onClick={() => { setAccent(id) }}
          >
            {/* Default shows the shipped brand ink; accents show their own hue. */}
            <span
              className={css.dot}
              style={swatch === undefined ? undefined : { '--accent-swatch': swatch } as CSSProperties}
            />
            <span className={css.label}>{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
