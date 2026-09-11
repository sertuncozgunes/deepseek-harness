/** Durable recency namespace shared by the Host settings registration and the
 * browser scope: recently executed command names (without the leading slash),
 * most recent first, capped at {@link COMMAND_RECENT_MAX}. */
import z from '@deepseek-ai/schemastery'

/** Settings namespace owning the recent-command list. */
export const COMMAND_RECENT_NS = 'command-recent'

/** Field carrying the ordered recent command names. */
export const COMMAND_RECENT_FIELD = 'recent'

/** Maximum number of recent commands retained (and rendered). */
export const COMMAND_RECENT_MAX = 6

/** Durable recent section. */
export interface CommandRecentSettings {
  /** Recent command names (no leading slash), most recent first. */
  recent: string[]
}

/** Durable recent schema; also the wire envelope the browser scope validates against. */
export const CommandRecentSchema = z.object({
  [COMMAND_RECENT_FIELD]: z.array(z.string()).default([]),
})
