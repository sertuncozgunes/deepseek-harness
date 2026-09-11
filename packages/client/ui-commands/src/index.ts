/**
 * Command UI plugin, node half. Registers the durable pinned-command settings
 * namespace; the browser half owns the favorites surface (the '/' menu group
 * and the per-row pin toggle). The host command registry itself mounts
 * separately (bootHost + CommandUiRuntime).
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import { COMMAND_FAVORITES_NS, CommandFavoritesSchema } from './command-favorites-settings.ts'

export {
  COMMAND_FAVORITES_FIELD, COMMAND_FAVORITES_NS, CommandFavoritesSchema,
  type CommandFavoritesSettings,
} from './command-favorites-settings.ts'

/**
 * Register the durable favorites section when the optional settings service
 * is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(COMMAND_FAVORITES_NS, CommandFavoritesSchema)
  })
}
