/** The right-pane Activity tab: a single glanceable view of what this session
 * is doing right now — its background jobs, its direct subagent children, and
 * the active goal — each sourced from the live session mirrors already flowing
 * through the client (no RPC). This is the persistent, in-flow twin of the
 * header job action and the subagent/goal surfaces. */
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { StateDot, type StateDotState, IconClockOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionJob } from '@deepseek-ai/dsh-api-session-controller/types'
import type { SubagentListEntry } from '@deepseek-ai/dsh-subagent/client'
import type { GoalView } from '@deepseek-ai/dsh-goal/client'
import css from './ActivityTab.module.css'

/** The tab kind this package owns. */
export const ACTIVITY_ID = '@deepseek-ai/dsh-client-ui-jobs-activity'

/** The type's registry definition (guide entry for the tab picker). */
export function activityDefinition(t: TranslateNS<'job'>): SidebarRightTabDefinition {
  return {
    id: ACTIVITY_ID,
    kind: 'activity',
    priority: 'builtin',
    title: () => t('tab.title'),
    guide: [{
      order: 30,
      title: () => t('tab.title'),
      description: () => t('tab.guide'),
      icon: IconClockOutline16,
    }],
  }
}

/** Status dot for a job status; same mapping as the header action. */
function jobDot(status: SessionJob['status']): StateDotState {
  switch (status) {
    case 'running': return 'ongoing'
    case 'stopping': return 'warning'
    case 'completed': return 'done'
    case 'killed': return 'warning'
    case 'failed': return 'error'
  }
}

/** Body props: standard pane-tab seat + the locale seat. */
export type ActivityTabProps =
  PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'job'>

/**
 * Render the Activity tab: jobs, subagents, and goal. Each section omits
 * itself when empty; a fully idle session shows the empty state.
 */
export function ActivityTab({ sessionId, useSessions, useProjection, t }: ActivityTabProps) {
  const jobs = useSessions(state => state.jobsBySession[sessionId]) ?? []
  const subagents: readonly SubagentListEntry[] = (useSessions(state => state.subagentsByParent[sessionId])?.entries) ?? []
  const goalProjection = useProjection('goal') as { goal?: GoalView } | undefined
  const goalView = goalProjection?.goal
  const empty = jobs.length === 0 && subagents.length === 0 && goalView === undefined
  if (empty) return <div className={css.empty}>{t('tab.empty')}</div>
  return (
    <div className={css.panel} data-activity-tab>
      {jobs.length > 0 && (
        <section className={css.section}>
          <div className={css.sectionTitle}>{t('tab.jobs')}</div>
          <ul className={css.list} data-activity-jobs>
            {jobs.map(job => (
              <li key={job.id} className={css.row}>
                <StateDot state={jobDot(job.status)} className={css.dot} />
                <span className={css.name}>{job.label}</span>
                <span className={css.meta}>{job.kind}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {subagents.length > 0 && (
        <section className={css.section}>
          <div className={css.sectionTitle}>{t('tab.subagents')}</div>
          <ul className={css.list} data-activity-subagents>
            {subagents.map(entry => (
              <li key={entry.kind === 'child' ? entry.id : `diag-${entry.id}`} className={css.row}>
                <StateDot
                  state={entry.kind === 'child' && entry.activity === 'running' ? 'ongoing' : 'idle'}
                  className={css.dot}
                />
                <span className={css.name}>
                  {entry.kind === 'child' ? (entry.mode === 'continuable' ? entry.label : (entry.label ?? entry.id)) : entry.reason}
                </span>
                <span className={css.meta}>{entry.kind === 'child' ? entry.mode : 'diagnostic'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {goalView !== undefined && (
        <section className={css.section}>
          <div className={css.sectionTitle}>{t('tab.goal')}</div>
          <div className={css.goal} data-activity-goal>
            <StateDot state={goalView.phase === 'active' ? 'ongoing' : 'warning'} className={css.dot} />
            <span className={css.name}>{goalView.objective}</span>
          </div>
        </section>
      )}
    </div>
  )
}

/** The tab chip: a ring glyph beside the (static) tab title. */
export function ActivityTabTitle({ useTabInfo }: PropsRuntime<'sidebar.right.pane.tab.title'>) {
  const { tab } = useTabInfo()
  return (
    <>
      <IconClockOutline16 className={css.titleIcon} />
      {tab.title}
    </>
  )
}
