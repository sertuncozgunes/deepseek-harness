/**
 * The right-pane Commands tab: a persistent, glanceable list of the session
 * user's pinned favorites and recently executed slash commands, read straight
 * from the durable command-favorites / command-recent settings namespaces.
 * Owning the / menu's storage means this tab and the menu stay in sync without
 * a service handshake — both render the same Host document.
 */
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { useSyncExternalStore } from 'react'
import { IconListPenOutline16, IconPinFill14, IconPinOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import { COMMAND_FAVORITES_FIELD, type CommandFavoritesSettings } from '../command-favorites-settings.ts'
import type { CommandRecentSettings } from '../command-recent-settings.ts'
import css from './CommandShortcutsTab.module.css'

/** The tab kind this package owns. */
export const COMMANDS_ID = '@deepseek-ai/dsh-client-ui-commands-shortcuts'

/** The type's registry definition (guide entry for the tab picker). */
export function commandsDefinition(t: TranslateNS<'command'>): SidebarRightTabDefinition {
  return {
    id: COMMANDS_ID,
    kind: 'commands',
    priority: 'builtin',
    title: () => t('tab.title'),
    guide: [{
      order: 10,
      title: () => t('tab.title'),
      description: () => t('tab.guide'),
      icon: IconListPenOutline16,
    }],
  }
}

/** Body props: standard pane-tab seat + locale + the two settings scopes. */
export type CommandShortcutsTabProps =
  PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'command'> & {
    favorites: SettingsScope<CommandFavoritesSettings>
    recent: SettingsScope<CommandRecentSettings>
  }

/** Read a settings scope's current value through useSyncExternalStore. */
function useSetting<T>(scope: SettingsScope<T>): T | undefined {
  return useSyncExternalStore(
    fn => scope.subscribe(fn),
    () => scope.getSnapshot().value,
  )
}

/**
 * Render the Commands tab body: pinned favorites (with unpin) and recent
 * commands as two sections; a single empty state when neither has entries.
 */
export function CommandShortcutsTab({ t, favorites, recent }: CommandShortcutsTabProps) {
  const fav = useSetting(favorites)
  const rec = useSetting(recent)
  const pinned = fav?.favorites ?? []
  const recentNames = rec?.recent ?? []
  const empty = pinned.length === 0 && recentNames.length === 0
  if (empty) return <div className={css.empty}>{t('tab.empty')}</div>
  return (
    <div className={css.panel} data-command-shortcuts-tab>
      {pinned.length > 0 && (
        <section className={css.section}>
          <div className={css.sectionTitle}>
            <span className={css.titleLabel}><IconPinFill14 />{t('tab.favorites')}</span>
          </div>
          <ul className={css.list} data-command-shortcuts-favorites>
            {pinned.map(name => (
              <li key={name} className={css.row}>
                <span className={css.rowName}>/{name}</span>
                <span
                  role="button"
                  aria-label={t('tab.unpin', { name })}
                  aria-pressed
                  className={css.unpin}
                  onClick={() => {
                    void favorites.set(COMMAND_FAVORITES_FIELD, pinned.filter(n => n !== name))
                  }}
                >
                  <IconPinOutline14 />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {recentNames.length > 0 && (
        <section className={css.section}>
          <div className={css.sectionTitle}>
            <span className={css.titleLabel}><IconListPenOutline16 />{t('tab.recent')}</span>
          </div>
          <ul className={css.list} data-command-shortcuts-recent>
            {recentNames.map(name => (
              <li key={name} className={css.row}>
                <span className={css.rowName}>/{name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/** The tab chip: a command glyph beside the (static) tab title. */
export function CommandShortcutsTabTitle({ useTabInfo }: PropsRuntime<'sidebar.right.pane.tab.title'>) {
  const { tab } = useTabInfo()
  return (
    <>
      <IconListPenOutline16 className={css.titleIcon} />
      {tab.title}
    </>
  )
}
