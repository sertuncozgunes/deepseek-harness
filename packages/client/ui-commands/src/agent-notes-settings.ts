/** Durable agent-notes namespace: a single persistent markdown string the
 * agent or user writes to carry memory across sessions. Shared by the Host
 * settings registration and the browser scope. */
import z from '@deepseek-ai/schemastery'

/** Settings namespace owning the notes. */
export const AGENT_NOTES_NS = 'agent-notes'

/** Field carrying the notes text. */
export const AGENT_NOTES_FIELD = 'notes'

/** Durable notes section. */
export interface AgentNotesSettings {
  /** Free-form memory text (markdown-serialized by convention). */
  notes: string
}

/** Durable notes schema; also the wire envelope the browser scope validates against. */
export const AgentNotesSchema = z.object({
  [AGENT_NOTES_FIELD]: z.string().default(''),
})
