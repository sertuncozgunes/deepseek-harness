/** `sidebar` namespace dictionaries for shell controls and global panels. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'session.new': '新会话',
  'session.new.label': '新建会话',
  'toggle.open': '打开侧边栏',
  'toggle.collapse': '收起侧边栏',
  'panels.label': '全局面板',
  'quickToggle.toLight': '切换到浅色主题',
  'quickToggle.toDark': '切换到深色主题',
} satisfies Record<string, string>

/** The sidebar namespace key union. */
export type SidebarKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'session.new': 'New Session',
  'session.new.label': 'New session',
  'toggle.open': 'Open sidebar',
  'toggle.collapse': 'Collapse sidebar',
  'panels.label': 'Global panels',
  'quickToggle.toLight': 'Switch to light theme',
  'quickToggle.toDark': 'Switch to dark theme',
} satisfies Record<SidebarKey, string>

/** Turkish dictionary, checked complete against the zh key set. */
export const tr= {
  'session.new': 'Yeni Oturum',
  'session.new.label': 'Yeni oturum',
  'toggle.open': 'Kenar çubuğunu aç',
  'toggle.collapse': 'Kenar çubuğunu daralt',
  'panels.label': 'Genel paneller',
  'quickToggle.toLight': 'Açık temaya geç',
  'quickToggle.toDark': 'Koyu temaya geç',
}
