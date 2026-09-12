/** `job` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'job'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'count.live.one': '{count} 个后台任务运行中',
  'count.live.other': '{count} 个后台任务运行中',
  'count.idle.one': '{count} 个后台任务',
  'count.idle.other': '{count} 个后台任务',
  'list.aria': '后台任务',
  'status.running': '运行中',
  'status.stopping': '正在停止',
  'status.completed': '已完成',
  'status.killed': '已取消',
  'status.failed': '已失败',
  'duration.seconds': '{seconds}秒',
  'duration.minutes': '{minutes}分{seconds}秒',
  'duration.hours': '{hours}小时{minutes}分',
  'duration.title.live': '已运行 {duration}',
  'duration.title.done': '耗时 {duration}',
  'tab.title': '活动',
  'tab.guide': '此会话的后台任务、子智能体与当前目标',
  'tab.jobs': '后台任务',
  'tab.subagents': '子智能体',
  'tab.goal': '目标',
  'tab.empty': '此会话当前没有后台任务、子智能体或活动目标。',
} as const

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<JobKey, string> = {
  'count.live.one': '{count} background job running',
  'count.live.other': '{count} background jobs running',
  'count.idle.one': '{count} background job',
  'count.idle.other': '{count} background jobs',
  'list.aria': 'Background jobs',
  'status.running': 'running',
  'status.stopping': 'stopping',
  'status.completed': 'completed',
  'status.killed': 'cancelled',
  'status.failed': 'failed',
  'duration.seconds': '{seconds}s',
  'duration.minutes': '{minutes}m {seconds}s',
  'duration.hours': '{hours}h {minutes}m',
  'duration.title.live': 'Running for {duration}',
  'duration.title.done': 'Took {duration}',
  'tab.title': 'Activity',
  'tab.guide': 'This session\u2019s background jobs, subagents, and current goal',
  'tab.jobs': 'Background jobs',
  'tab.subagents': 'Subagents',
  'tab.goal': 'Goal',
  'tab.empty': 'This session has no background jobs, subagents, or active goal right now.',
}

/** Key domain of the `job` namespace (zh is the source of truth). */
export type JobKey = keyof typeof zh

/** Turkish dictionary, checked complete against the zh key set. */
export const tr: Record<JobKey, string>= {
  'count.live.one': '{count} arka plan görevi çalışıyor',
  'count.live.other': '{count} arka plan görevi çalışıyor',
  'count.idle.one': '{count} arka plan görevi',
  'count.idle.other': '{count} arka plan görevi',
  'list.aria': 'Arka plan görevleri',
  'status.running': 'çalışıyor',
  'status.stopping': 'durduruluyor',
  'status.completed': 'tamamlandı',
  'status.killed': 'iptal edildi',
  'status.failed': 'başarısız',
  'duration.seconds': '{seconds} sn',
  'duration.minutes': '{minutes} dk {seconds} sn',
  'duration.hours': '{hours} sa {minutes} dk',
  'duration.title.live': '{duration} süredir çalışıyor',
  'duration.title.done': '{duration} sürdü',
  'tab.title': 'Etkinlik',
  'tab.guide': 'Bu oturumun arka plan görevleri, alt ajanları ve geçerli hedefi',
  'tab.jobs': 'Arka plan görevleri',
  'tab.subagents': 'Alt ajanlar',
  'tab.goal': 'Hedef',
  'tab.empty': 'Bu oturumda şu an arka plan görevi, alt ajan veya etkin hedef yok.',
}
