/** Sidebar-foot theme quick-toggle: one click flips the resolved color
 * scheme. Owned by ui-sidebar (its footer surface) and rendered into the
 * `sidebar.footer.action` list slot this package declares. */
import { useEffect, useState } from 'react'
import { IconDarkOutline16, IconLightOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import css from './ThemeToggle.module.css'

/** Structural slice of the theme service this surface needs. */
export interface ThemeToggleThemeFace {
  getTheme(): { active: { id: string } }
  setTheme(id: string): void
}

/** Injected face handed to the occupant through the slot registration. */
export interface ThemeToggleInjected {
  theme: ThemeToggleThemeFace
  /** Subscribe to theme changes; returns the unsubscriber. */
  subscribeTheme(fn: () => void): () => void
}

/** Owner share supplied by the sidebar foot (unused: the button is self-sized). */
export interface ThemeToggleOwnerProps {
  wide: boolean
}

/**
 * Render the quick-toggle button. The icon shows the scheme one click lands
 * on (a moon while dark, a sun while light) so the affordance names its next
 * action in both the tooltip and the accessible label.
 * @param props - injected theme face + change subscription, locale seat, and
 * the sidebar's owner share.
 * @returns the tooltip-wrapped icon button.
 */
export function ThemeToggle({ theme, subscribeTheme, t, wide: _wide }: ThemeToggleInjected & ThemeToggleOwnerProps & { t: TranslateNS<'sidebar'> }) {
  const [dark, setDark] = useState(() => theme.getTheme().active.id === 'dark')
  useEffect(() => subscribeTheme(() => {
    setDark(theme.getTheme().active.id === 'dark')
  }), [theme, subscribeTheme])
  const label = dark ? t('quickToggle.toLight') : t('quickToggle.toDark')
  return (
    <Tooltip label={label} delayMs={500}>
      <button
        type="button"
        className={css.toggle}
        aria-label={label}
        onClick={() => { theme.setTheme(dark ? 'light' : 'dark') }}
      >
        {dark ? <IconLightOutline16 size={16} /> : <IconDarkOutline16 size={16} />}
      </button>
    </Tooltip>
  )
}
