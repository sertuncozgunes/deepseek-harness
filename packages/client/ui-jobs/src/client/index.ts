/**
 * Background-job plugin, browser half: contributes one session-header action
 * that renders this session's `ctx.jobs` records. The data arrives entirely
 * through the `jobsBySession` list mirror, so the plugin issues no RPC and
 * holds no state of its own beyond popover visibility.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { JobListAction } from './JobListAction.tsx'
import { activityDefinition, ActivityTab, ActivityTabTitle, ACTIVITY_ID } from './ActivityTab.tsx'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { tr,  en, NS, zh, type JobKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Background-job list copy. */
    'job': JobKey
  }
}

export type { JobListActionProps } from './JobListAction.tsx'

/** Required services for locale registration and header-slot contribution. */
export const inject = ['sessions', 'slots', 'locale']

/**
 * Client plugin body: register the dictionaries and the header action.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en, tr }), 'ui-job: dictionaries')
  ctx.slots.inject(
    'conversation.session.header.actions',
    () => ctx.slots.register({
      name: 'conversation.session.header.actions',
      id: 'job-list',
      // After the subagent catalog: session lineage reads before process work.
      order: 20,
      locale: NS,
    }, JobListAction),
  )

  // Right-pane Activity tab: the persistent, in-flow twin of the header action,
  // combining this session's jobs, subagents, and goal from the live mirrors.
  const jobT = ctx.locale.bind(NS)
  ctx.inject(['slots', 'sidebarRightTabs'], (scope: ClientContext) => {
    scope.effect(() => scope.sidebarRightTabs.register(activityDefinition(jobT)), 'ui-jobs: activity tab type')
    scope.effect(() => scope.slots.inject('sidebar.right.pane.tab', () => scope.slots.register(
      { name: 'sidebar.right.pane.tab', key: ACTIVITY_ID, locale: NS },
      ActivityTab,
    )), 'ui-jobs: activity tab body')
    scope.effect(() => scope.slots.inject('sidebar.right.pane.tab.title', () => scope.slots.register(
      { name: 'sidebar.right.pane.tab.title', key: ACTIVITY_ID },
      ActivityTabTitle,
    )), 'ui-jobs: activity tab title')
  })
}
