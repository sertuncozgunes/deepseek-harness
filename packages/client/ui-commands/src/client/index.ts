/**
 * Command UI plugin, browser half: CommandUiRuntime (`ctx.commandUi`) owning the
 * capability-keyed directory cache, the '/' command source, the client
 * contribution registry, and the per-session popupSelect controllers; the
 * popupSelect shell self-registers into conversation.input.overlay with
 * per-session resolution.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
// Type-only: pulls the 'conversation.input.overlay' SlotMap declaration (the
// key's owner) into this program so the overlay registration below typechecks
// against the real declaration — no runtime edge to ui-conversation.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { CommandUiRuntime } from './service.ts'
import type { PopupSelectInjected } from './PopupSelectView.tsx'
import { PopupSelectView } from './PopupSelectView.tsx'
import { tr,  en, zh, type CommandKey } from './locales.ts'
import { commandsDefinition, CommandShortcutsTab, CommandShortcutsTabTitle, COMMANDS_ID } from './CommandShortcutsTab.tsx'
import { CommandPalette } from './CommandPalette.tsx'
import { ShortcutHelp } from './ShortcutHelp.tsx'
import { COMMAND_FAVORITES_NS, type CommandFavoritesSettings } from '../command-favorites-settings.ts'
import { COMMAND_RECENT_NS, type CommandRecentSettings } from '../command-recent-settings.ts'

export { CommandUiRuntime } from './service.ts'
export { CommandDirectory } from './directory.ts'
export type { CommandDescriptor, DirectoryStatus } from './directory.ts'
export { filterOptions, PopupSelectController } from './popup.ts'
export type { PopupSelectDeps, PopupSpec, PopupState, TokenSegment } from './popup.ts'
export type { PopupSelectInjected, PopupSelectViewProps } from './PopupSelectView.tsx'
export type {
  ActionSpec, CommandContribution, CommandDecoration, CommandUiContract, CommandUiSpec, PopupSelectSpec,
  SelectConfirmation, SelectOption,
} from './contract.ts'
export type { CommandKey } from './locales.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    commandUi: CommandUiRuntime
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The menu rows' and the popupSelect shell's copy. */
    command: CommandKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'command'

/** Required services: the '/' source registry, session scopes, commands Remote, and locale registry. */
export const inject = ['inputTriggers', 'sessions', 'remote', 'remote.commands', 'settingsScope', 'locale']

/**
 * Mount the command service and its per-session popupSelect overlay.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en, tr }), 'ui-commands: dictionaries')
  ctx.plugin(CommandUiRuntime)
  ctx.inject(['slots', 'commandUi', 'sessions'], (scope: ClientContext) => {
    const command = scope.commandUi
    const sessions = scope.get('sessions') as ISessions
    scope.slots.inject('conversation.input.overlay', () => scope.slots.register({
      name: 'conversation.input.overlay',
      id: 'command-popup',
      order: 1,
      locale: NS,
      inject: (sessionId): PopupSelectInjected => {
        const actx = sessions.scope(sessionId)
        if (actx === undefined) throw new Error(`ui-commands: session "${String(sessionId)}" resolved no scope`)
        return { popup: command.popupFor(actx) }
      },
    }, PopupSelectView))
  })

  // Right-pane Commands tab: a persistent glanceable list of pinned favorites
  // and recent commands, reading the same durable scopes the / menu writes.
  const commandsT = ctx.locale.bind(NS)
  ctx.inject(['slots', 'sidebarRightTabs', 'settingsScope'], (scope: ClientContext) => {
    const favoritesScope = scope.settingsScope.bind<CommandFavoritesSettings>({ namespace: COMMAND_FAVORITES_NS })
    const recentScope = scope.settingsScope.bind<CommandRecentSettings>({ namespace: COMMAND_RECENT_NS })
    scope.effect(() => scope.sidebarRightTabs.register(commandsDefinition(commandsT)), 'ui-commands: commands tab type')
    scope.effect(() => scope.slots.inject('sidebar.right.pane.tab', () => scope.slots.register(
      { name: 'sidebar.right.pane.tab', key: COMMANDS_ID, locale: NS, inject: () => ({ favorites: favoritesScope, recent: recentScope }) },
      CommandShortcutsTab,
    )), 'ui-commands: commands tab body')
    scope.effect(() => scope.slots.inject('sidebar.right.pane.tab.title', () => scope.slots.register(
      { name: 'sidebar.right.pane.tab.title', key: COMMANDS_ID },
      CommandShortcutsTabTitle,
    )), 'ui-commands: commands tab title')
  })

  // Global ⌘K command palette on the frame-wide overlay seat. The palette reads
  // the active session from the root standard share (useSessions) and routes a
  // picked command back through commandUi.insertCommandText.
  ctx.inject(['slots', 'commandUi'], (scope: ClientContext) => {
    scope.slots.inject('shell.overlay', () => scope.slots.register({
      name: 'shell.overlay',
      id: 'command-palette',
      order: 90,
      locale: NS,
      inject: (): { commandUi: typeof scope.commandUi } => ({ commandUi: scope.commandUi }),
    }, CommandPalette))

    // Keyboard-shortcuts help, opened by Meta+/ — a pure locale-surface overlay.
    scope.slots.inject('shell.overlay', () => scope.slots.register({
      name: 'shell.overlay',
      id: 'shortcut-help',
      order: 91,
      locale: NS,
    }, ShortcutHelp))
  })
}
