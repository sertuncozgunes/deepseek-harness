/** `settings.theme` namespace dictionaries (the Appearance and font-size rows' copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'appearance.title': '外观',
  'appearance.light': '浅色',
  'appearance.dark': '深色',
  'appearance.system': '跟随系统',
  'fontSize.title': '字号大小',
  'fontSize.description': '仅影响会话内容的字号',
  'fontSize.unit': 'px',
  'fontSize.increase': '增大字号',
  'fontSize.decrease': '减小字号',
  'accent.title': '强调色',
  'accent.default': '默认',
  'accent.blue': '蓝色',
  'accent.deepseek': '深寻蓝',
  'accent.red': '红色',
  'accent.green': '绿色',
  'accent.amber': '琥珀色',
} satisfies Record<string, string>

/** The settings.theme namespace key union. */
export type ThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'fontSize.title': 'Font size',
  'fontSize.description': 'Only affects conversation content',
  'fontSize.unit': 'px',
  'fontSize.increase': 'Increase font size',
  'fontSize.decrease': 'Decrease font size',
  'accent.title': 'Accent color',
  'accent.default': 'Default',
  'accent.blue': 'Blue',
  'accent.deepseek': 'DeepSeek Blue',
  'accent.red': 'Red',
  'accent.green': 'Green',
  'accent.amber': 'Amber',
} satisfies Record<ThemeKey, string>

/** Turkish dictionary, checked complete against the zh key set. */
export const tr= {
  'appearance.title': 'Görünüm',
  'appearance.light': 'Açık',
  'appearance.dark': 'Koyu',
  'appearance.system': 'Sistem',
  'fontSize.title': 'Yazı boyutu',
  'fontSize.description': 'Yalnızca konuşma içeriğini etkiler',
  'fontSize.unit': 'px',
  'fontSize.increase': 'Yazıyı büyüt',
  'fontSize.decrease': 'Yazıyı küçült',
  'accent.title': 'Vurgu rengi',
  'accent.default': 'Varsayılan',
  'accent.blue': 'Mavi',
  'accent.deepseek': 'DeepSeek Mavisi',
  'accent.red': 'Kırmızı',
  'accent.green': 'Yeşil',
  'accent.amber': 'Kehribar',
}
