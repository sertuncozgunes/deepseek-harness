/** The right-pane Stats tab: a persistent, in-flow reading of the session's
 * whole-log figures (counts, wall times, token buckets) — the same data the
 * composer pills open in dialogs, rendered as a dockable tab body. Owned by
 * ui-chat and registered into the session-scoped pane-tab slot. */
import type { UseProjection } from '@deepseek-ai/dsh-api-session-controller/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import type { PropsRuntime, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
// Type-only: merges the sessionStats key into SessionProjectionMap for useProjection.
import type {} from '@deepseek-ai/dsh-session-stats/client'
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { IconDatabaseOutline16, IconGaugeOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { billedInputTokens, cacheHitPercent, formatDuration } from './StatsPills.tsx'
import { formatTokensPerSecond } from './message-chrome.ts'
import { formatExactTokens, formatTokens } from './token-format.ts'
import css from './stats-tab.module.css'

/** The tab kind and key this package owns. */
export const STATS_ID = '@deepseek-ai/dsh-client-ui-chat-stats'

/** The type's registry definition (guide entry for the tab picker). */
export function statsDefinition(t: TranslateNS<'chat'>): SidebarRightTabDefinition {
  return {
    id: STATS_ID,
    kind: 'stats',
    priority: 'builtin',
    title: () => t('stats.tab.title'),
    guide: [{
      order: 20,
      title: () => t('stats.tab.title'),
      description: () => t('stats.tab.guide'),
      icon: IconGaugeOutline16,
    }],
  }
}

/** Whole-log figures served by the sessionStats projection. */
interface StatsReading {
  turns: number
  steps: number
  llmMs: number
  toolMs: number
  ttftMs: number
  ttftSteps: number
  decodeMs: number
  decodeTokens: number
}

function exactCount(value: number, t: TranslateNS<'chat'>): string {
  return t('message.turnUsage.count', { count: formatExactTokens(value, t) })
}

/** Full component props: session standard share + tab hooks + locale seat. */
export type StatsTabBodyProps =
  PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'chat'> & {
    sessionId: SessionId
    useProjection: UseProjection
  }

/**
 * Render the Stats tab body.
 * @param props - composed slot props.
 * @returns the panel element tree.
 */
export function StatsTabBody({ t, useProjection }: StatsTabBodyProps) {
  const stats = useProjection('sessionStats') as StatsReading | undefined
  const usage = useProjection('tokenUsage') as TokenUsageProjection | undefined
  const hasTokens = usage !== undefined && (billedInputTokens(usage) > 0 || usage.outputTokens > 0)
  if ((stats === undefined || stats.steps === 0) && !hasTokens) {
    return <div className={css.empty}>{t('stats.tab.empty')}</div>
  }
  return (
    <div className={css.panel}>
      {stats !== undefined && stats.steps > 0 && (
        <section className={css.section}>
          <div className={css.sectionTitle}>
            <span className={css.titleLabel}><IconGaugeOutline16 />{t('stats.dialog.title')}</span>
          </div>
          <div className={css.headline}>{t('stats.counts', { turns: stats.turns, steps: stats.steps })}</div>
          <dl className={css.details} data-session-stats-tab>
            {stats.llmMs > 0 && (<><dt>{t('stats.dialog.llmTime')}</dt><dd>{formatDuration(stats.llmMs, t)}</dd></>)}
            {stats.toolMs > 0 && (<><dt>{t('stats.dialog.toolTime')}</dt><dd>{formatDuration(stats.toolMs, t)}</dd></>)}
            {stats.ttftSteps > 0 && (<><dt>{t('stats.dialog.ttft')}</dt><dd>{formatDuration(stats.ttftMs / stats.ttftSteps, t)}</dd></>)}
            {stats.decodeMs > 0 && (<><dt>{t('stats.dialog.speed')}</dt><dd>{t('message.tokensPerSecond', {
              tps: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1_000)),
            })}</dd></>)}
          </dl>
        </section>
      )}
      {hasTokens && usage !== undefined && (
        <section className={css.section}>
          <div className={css.sectionTitle}>
            <span className={css.titleLabel}><IconDatabaseOutline16 />{t('stats.dialog.usageTitle')}</span>
            <span className={css.titleValue}>{t('message.turnUsage.count', {
              count: formatTokens(billedInputTokens(usage) + usage.outputTokens, t),
            })}</span>
          </div>
          <div className={css.titleRule} aria-hidden />
          <dl className={css.details} data-session-stats-tab-usage>
            {cacheHitPercent(usage) !== null && (
              <><dt>{t('message.turnUsage.cacheHit')}</dt><dd>{`${cacheHitPercent(usage)}%`}</dd></>
            )}
            <dt>{t('message.turnUsage.input')}</dt>
            <dd>{exactCount(usage.uncachedInputTokens, t)}</dd>
            <dt>{t('message.turnUsage.cacheRead')}</dt>
            <dd>{exactCount(usage.cacheReadTokens, t)}</dd>
            {usage.cacheWriteTokens !== 0 && (
              <><dt>{t('message.turnUsage.cacheWrite')}</dt><dd>{exactCount(usage.cacheWriteTokens, t)}</dd></>
            )}
            <dt>{t('message.turnUsage.output')}</dt>
            <dd>{exactCount(usage.outputTokens, t)}</dd>
          </dl>
        </section>
      )}
    </div>
  )
}

/** The tab chip: a gauge glyph beside the (possibly live) tab title. */
export function StatsTabTitle({ useTabInfo }: PropsRuntime<'sidebar.right.pane.tab.title'>) {
  const { tab } = useTabInfo()
  return (
    <>
      <IconGaugeOutline16 className={css.titleIcon} />
      {tab.title}
    </>
  )
}
