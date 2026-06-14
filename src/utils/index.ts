import dayjs from 'dayjs'
import type { EpisodeStatus, Priority, TaskType } from '@/types'

export const STATUS_CONFIG: Record<
  EpisodeStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  idea: { label: '选题中', color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
  planning: { label: '筹备中', color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6' },
  recording: { label: '录制中', color: '#7c3aed', bg: '#ede9fe', dot: '#8b5cf6' },
  editing: { label: '剪辑中', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  reviewing: { label: '审核中', color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
  ready: { label: '待发布', color: '#059669', bg: '#d1fae5', dot: '#10b981' },
  published: { label: '已发布', color: '#0891b2', bg: '#cffafe', dot: '#06b6d4' },
  archived: { label: '已归档', color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' },
}

export const STATUS_FLOW: EpisodeStatus[] = [
  'idea',
  'planning',
  'recording',
  'editing',
  'reviewing',
  'ready',
  'published',
]

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: '低', color: '#9ca3af' },
  medium: { label: '中', color: '#f59e0b' },
  high: { label: '高', color: '#ef4444' },
  urgent: { label: '紧急', color: '#dc2626' },
}

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  topic: '选题',
  guest: '嘉宾',
  outline: '提纲',
  recording: '录制',
  material: '素材',
  editing: '剪辑',
  copyright: '版权',
  cover: '封面',
  copy: '文案',
  review: '审核',
  publish: '发布',
}

export const CLIP_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  highlight: { label: '高光', color: '#ef4444' },
  quote: { label: '金句', color: '#f59e0b' },
  ad: { label: '广告位', color: '#10b981' },
  jingle: { label: '片花', color: '#8b5cf6' },
  error: { label: '待修正', color: '#6b7280' },
}

export function formatDate(date: string | null | undefined, format = 'YYYY-MM-DD') {
  if (!date) return '—'
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | null | undefined) {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

export function daysUntil(deadline: string): number {
  return dayjs(deadline).diff(dayjs(), 'day')
}

export function getDeadlineLabel(deadline: string): { text: string; color: string } {
  const days = daysUntil(deadline)
  if (days < 0) return { text: `已逾期 ${Math.abs(days)} 天`, color: '#dc2626' }
  if (days === 0) return { text: '今天截止', color: '#dc2626' }
  if (days === 1) return { text: '明天截止', color: '#f59e0b' }
  if (days <= 3) return { text: `${days} 天后截止`, color: '#f59e0b' }
  if (days <= 7) return { text: `${days} 天后截止`, color: '#6b7280' }
  return { text: `${days} 天后截止`, color: '#9ca3af' }
}

export function initials(name: string): string {
  return name.slice(0, 2)
}

export function getProgress(episode: {
  outline: { done: boolean }[]
  editTodos: { done: boolean }[]
  recordings: unknown[]
  reviews: { resolved: boolean }[]
  publishCheck: Record<string, boolean | string[]>
}): { pct: number; total: number; done: number } {
  const items = [
    { group: 'outline', arr: episode.outline, weight: 20 },
    { group: 'recordings', arr: episode.recordings.length > 0 ? [1] : [], weight: 20 },
    { group: 'editTodos', arr: episode.editTodos, weight: 25 },
    { group: 'reviews', arr: episode.reviews, weight: 15 },
  ]
  let totalWeight = 0
  let doneWeight = 0
  let total = 0
  let done = 0
  for (const { arr, weight } of items) {
    totalWeight += weight
    total += arr.length
    if (arr.length === 0) continue
    const doneCount = arr.filter((x: any) => (typeof x === 'object' ? x.done || x.resolved : true)).length
    done += doneCount
    doneWeight += (doneCount / arr.length) * weight
  }
  const check = episode.publishCheck
  const checkKeys = ['audioQuality', 'metadata', 'coverArt', 'showNotes', 'chapters', 'sponsorship', 'rssFeed']
  const checkDone = checkKeys.filter((k) => check[k]).length
  total += checkKeys.length
  done += checkDone
  doneWeight += (checkDone / checkKeys.length) * 20
  totalWeight += 20
  return {
    pct: Math.round((doneWeight / totalWeight) * 100),
    total,
    done,
  }
}
