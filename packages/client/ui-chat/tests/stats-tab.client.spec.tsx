// @vitest-environment jsdom
/**
 * StatsTabBody rendering spec, props-direct: the empty state when neither
 * projection carries figures, then the count/timing rows and the token
 * buckets once the projections serve values — the same copy the composer
 * pills' dialogs use.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locale.ts'
import { StatsTabBody } from '../src/client/chat/stats-tab.tsx'

const t = makeTranslate(zh, commonZh)

const usage = (over: Partial<{
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}> = {}) => ({
  uncachedInputTokens: 1000,
  cacheReadTokens: 4000,
  cacheWriteTokens: 0,
  outputTokens: 500,
  ...over,
})

const stats = (over: Partial<{
  turns: number
  steps: number
  llmMs: number
  toolMs: number
  ttftMs: number
  ttftSteps: number
  decodeMs: number
  decodeTokens: number
}> = {}) => ({
  turns: 2,
  steps: 5,
  llmMs: 6000,
  toolMs: 1200,
  ttftMs: 900,
  ttftSteps: 3,
  decodeMs: 4000,
  decodeTokens: 500,
  ...over,
})

function mount(projections: Record<string, unknown>) {
  const useProjection = (key: string) => projections[key]
  const props = {
    t,
    sessionId: 's1',
    useProjection,
    useTabInfo: () => ({ tab: { title: 'x' } }),
  }
  const Body = StatsTabBody as unknown as (p: typeof props) => React.JSX.Element
  const view = render(createElement(Body, props))
  return view
}

describe('StatsTabBody', () => {
  afterEach(() => { cleanup() })

  it('shows the empty state when neither projection carries figures', () => {
    mount({})
    expect(screen.getByText('本会话还没有统计数据。')).toBeTruthy()
  })

  it('renders counts, timings, and token buckets from the projections', () => {
    mount({
      sessionStats: stats(),
      tokenUsage: usage(),
    })
    expect(screen.getByText('2 轮 5 步')).toBeTruthy()
    expect(screen.getByText('模型用时')).toBeTruthy()
    expect(screen.getByText('工具调用用时')).toBeTruthy()
    expect(screen.getByText('首 token 平均（TTFT）')).toBeTruthy()
    expect(screen.getByText('输出速度（TPS）')).toBeTruthy()
    expect(screen.getByText('Token 用量')).toBeTruthy()
    expect(screen.getByText('缓存命中')).toBeTruthy()
    expect(screen.getByText('未缓存输入')).toBeTruthy()
    expect(screen.getByText('输出')).toBeTruthy()
  })

  it('drops the usage section when the session billed no tokens', () => {
    mount({
      sessionStats: stats({ llmMs: 0, toolMs: 0, ttftSteps: 0, decodeMs: 0 }),
      tokenUsage: usage({ uncachedInputTokens: 0, cacheReadTokens: 0, outputTokens: 0 }),
    })
    expect(screen.queryByText('Token 用量')).toBeNull()
  })
})
