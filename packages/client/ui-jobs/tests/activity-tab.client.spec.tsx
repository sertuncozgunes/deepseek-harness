// @vitest-environment jsdom
/**
 * ActivityTab rendering spec, props-direct: the empty state when there are no
 * jobs/subagents/goal, then each section once the live mirrors serve values —
 * jobs with status dots, subagent children with activity dots, and the active
 * goal with its objective.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locales.ts'
import { ActivityTab } from '../src/client/ActivityTab.tsx'
import type { SessionJob } from '@deepseek-ai/dsh-api-session-controller/types'

const t = makeTranslate(zh, commonZh)

const job = (over: Partial<SessionJob> = {}): SessionJob => ({
  id: 'j1' as never,
  kind: 'shell',
  label: 'run tests',
  status: 'running',
  startedAt: 1000,
  ...over,
})

interface SubagentEntryView {
  kind: string
  id: string
  activity?: string
  mode?: string
  label?: string
  reason?: string
}

interface StateView {
  jobsBySession: Record<string, SessionJob[]>
  subagentsByParent: Record<string, { entries: readonly SubagentEntryView[] }>
}

function mount(view: StateView, goal?: { goal?: { objective: string; phase: string } }) {
  const props = {
    t,
    sessionId: 's1',
    useProjection: (_key: string) => goal,
    useSessions: (selector: (s: StateView) => unknown) => selector(view),
    useTabInfo: () => ({ tab: { title: 'x' } }),
  }
  const Body = ActivityTab as unknown as (p: typeof props) => React.JSX.Element
  const viewResult = render(createElement(Body, props))
  return viewResult
}

describe('ActivityTab', () => {
  afterEach(() => { cleanup() })

  it('shows the empty state when there is no activity', () => {
    mount({ jobsBySession: {}, subagentsByParent: {} })
    expect(screen.getByText('此会话当前没有后台任务、子智能体或活动目标。')).toBeTruthy()
  })

  it('renders jobs with their labels and kinds', () => {
    mount({ jobsBySession: { s1: [job()] }, subagentsByParent: {} })
    expect(screen.getByText('后台任务')).toBeTruthy()
    expect(screen.getByText('run tests')).toBeTruthy()
    expect(screen.getByText('shell')).toBeTruthy()
  })

  it('renders subagent children with their labels', () => {
    mount({
      jobsBySession: {},
      subagentsByParent: { s1: { entries: [{ kind: 'child', id: 'c1', activity: 'running', mode: 'continuable', label: 'researcher' }] } },
    })
    expect(screen.getByText('子智能体')).toBeTruthy()
    expect(screen.getByText('researcher')).toBeTruthy()
  })

  it('renders the active goal objective', () => {
    mount({ jobsBySession: {}, subagentsByParent: {} }, { goal: { objective: 'Ship the release', phase: 'active' } })
    expect(screen.getByText('目标')).toBeTruthy()
    expect(screen.getByText('Ship the release')).toBeTruthy()
  })
})
