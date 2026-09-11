/** Durable favorites namespace shared by the Host settings registration and
 * the browser scope: the pinned command names (without the leading slash),
 * newest pin last. */
import z from '@deepseek-ai/schemastery'

/** Settings namespace owning the pinned-command list. */
export const COMMAND_FAVORITES_NS = 'command-favorites'

/** Field carrying the ordered pinned command names. */
export const COMMAND_FAVORITES_FIELD = 'favorites'

/** Durable favorites section. */
export interface CommandFavoritesSettings {
  /** Pinned command names (no leading slash), newest last. */
  favorites: string[]
}

/** Durable favorites schema; also the wire envelope the browser scope validates against. */
export const CommandFavoritesSchema = z.object({
  [COMMAND_FAVORITES_FIELD]: z.array(z.string()).default([]),
})
