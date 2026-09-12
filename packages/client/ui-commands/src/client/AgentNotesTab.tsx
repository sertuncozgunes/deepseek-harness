/** The right-pane Notes tab: an editable persistent scratchpad backed by the
 * durable agent-notes settings namespace. The agent and the user share one
 * markdown string that survives reloads; edits ride the settings scope (the
 * Host document stays the single source of truth). */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { useSyncExternalStore, useState, useEffect } from 'react'
import { IconListPenOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import { AGENT_NOTES_FIELD, type AgentNotesSettings } from '../agent-notes-settings.ts'
import css from './AgentNotesTab.module.css'

/** The tab kind this package owns. */
export const NOTES_ID = '@deepseek-ai/dsh-client-ui-commands-notes'

/** The type's registry definition (guide entry for the tab picker). */
export function notesDefinition(t: TranslateNS<'command'>): SidebarRightTabDefinition {
  return {
    id: NOTES_ID,
    kind: 'notes',
    priority: 'builtin',
    title: () => t('notes.title'),
    guide: [{
      order: 5,
      title: () => t('notes.title'),
      description: () => t('notes.guide'),
      icon: IconListPenOutline16,
    }],
  }
}

/** Body props: standard pane-tab seat plus the notes settings scope. */
export type AgentNotesTabProps =
  PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'command'> & {
    notes: SettingsScope<AgentNotesSettings>
  }

/**
 * Render the Notes tab: an editable textarea bound to the durable notes value.
 * Saves on blur, so accidental keystrokes do not clobber the Host document.
 */
export function AgentNotesTab({ t, notes }: AgentNotesTabProps) {
  const value = useSyncExternalStore(
    fn => notes.subscribe(fn),
    () => notes.getSnapshot().value?.notes ?? '',
  )
  const [draft, setDraft] = useState(value)
  // Refresh the draft when another tab/scope writes the durable value.
  useEffect(() => { setDraft(value) }, [value])

  return (
    <div className={css.panel} data-agent-notes-tab>
      <div className={css.hint}>{t('notes.hint')}</div>
      <textarea
        className={css.textarea}
        value={draft}
        placeholder={t('notes.placeholder')}
        aria-label={t('notes.title')}
        onChange={(e) => { setDraft(e.target.value) }}
        onBlur={() => { void notes.set(AGENT_NOTES_FIELD, draft) }}
        spellCheck={false}
      />
    </div>
  )
}

/** The tab chip: a list-pen glyph beside the (static) tab title. */
export function AgentNotesTabTitle({ useTabInfo }: PropsRuntime<'sidebar.right.pane.tab.title'>) {
  const { tab } = useTabInfo()
  return (
    <>
      <IconListPenOutline16 className={css.titleIcon} />
      {tab.title}
    </>
  )
}
