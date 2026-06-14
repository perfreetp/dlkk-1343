export type EpisodeStatus =
  | 'idea'
  | 'planning'
  | 'recording'
  | 'editing'
  | 'reviewing'
  | 'ready'
  | 'published'
  | 'archived'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskType =
  | 'topic'
  | 'guest'
  | 'outline'
  | 'recording'
  | 'material'
  | 'editing'
  | 'copyright'
  | 'cover'
  | 'copy'
  | 'review'
  | 'publish'

export interface Member {
  id: string
  name: string
  role: string
  avatar: string
  color: string
}

export interface Guest {
  id: string
  name: string
  title: string
  company: string
  avatar: string
  contacts: { type: string; value: string }[]
  tags: string[]
  bio: string
  history: { episodeId: string; episodeTitle: string; date: string }[]
  notes: string
  createdAt: string
}

export interface OutlineItem {
  id: string
  time: string
  title: string
  description: string
  notes: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export interface RecordingItem {
  id: string
  name: string
  track: string
  duration: string
  format: string
  size: string
  importedAt: string
  notes: string
}

export interface ClipMarker {
  id: string
  type: 'highlight' | 'quote' | 'ad' | 'jingle' | 'error'
  start: string
  end: string
  description: string
  color: string
}

export interface EditTodo {
  id: string
  content: string
  assigneeId: string
  deadline: string
  priority: Priority
  done: boolean
  createdAt: string
  updatedAt: string
}

export interface MusicItem {
  id: string
  name: string
  artist: string
  album: string
  license: string
  usage: string
  duration: string
  cost: string
  notes: string
}

export interface ReviewComment {
  id: string
  reviewerId: string
  content: string
  timestamp: string
  resolved: boolean
  resolution?: 'approved' | 'rejected'
  replies: { id: string; authorId: string; content: string; timestamp: string }[]
}

export interface SponsorSlot {
  id: string
  sponsor: string
  type: 'pre' | 'mid' | 'post'
  duration: string
  position: string
  script: string
  done: boolean
}

export interface ListenerData {
  id: string
  date: string
  plays: number
  downloads: number
  avgListen: string
  newSubs: number
  dropOff: number
  createdAt: string
  updatedAt: string
}

export interface EpisodeGuestInfo {
  guestId: string
  role: string
  status: 'pending' | 'confirmed' | 'declined' | 'reminded'
  reminder: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type ActivityAction =
  | 'status_change'
  | 'review_added'
  | 'review_resolved'
  | 'review_approved'
  | 'review_rejected'
  | 'guest_added'
  | 'guest_removed'
  | 'guest_updated'
  | 'outline_added'
  | 'outline_updated'
  | 'outline_deleted'
  | 'outline_toggled'
  | 'edit_todo_added'
  | 'edit_todo_updated'
  | 'edit_todo_deleted'
  | 'edit_todo_toggled'
  | 'mistake_toggled'
  | 'publish_check_updated'
  | 'published_date_changed'
  | 'listener_data_added'
  | 'listener_data_updated'
  | 'listener_data_deleted'

export interface ActivityLog {
  id: string
  action: ActivityAction
  memberId: string
  timestamp: string
  detail: string
  meta?: Record<string, any>
}

export interface Episode {
  id: string
  seasonId: string
  number: number
  title: string
  subtitle: string
  status: EpisodeStatus
  coverUrl: string
  topics: string[]
  guestIds: string[]
  outline: OutlineItem[]
  recordings: RecordingItem[]
  clips: ClipMarker[]
  mistakes: { id: string; time: string; description: string; fixed: boolean }[]
  editTodos: EditTodo[]
  musics: MusicItem[]
  coverDrafts: { id: string; url: string; version: string; selected: boolean }[]
  copywriting: {
    showNotes: string
    chapters: string
    social: string
    titleOptions: string[]
  }
  timelineNotes: { time: string; note: string }[]
  reviews: ReviewComment[]
  publishCheck: {
    audioQuality: boolean
    metadata: boolean
    coverArt: boolean
    showNotes: boolean
    chapters: boolean
    sponsorship: boolean
    rssFeed: boolean
    platforms: string[]
  }
  sponsorSlots: SponsorSlot[]
  scheduledDate: string
  publishedDate: string | null
  deadline: string
  assigneeIds: string[]
  listenerData: ListenerData[]
  guestInfo: EpisodeGuestInfo[]
  activityLog: ActivityLog[]
  createdAt: string
  updatedAt: string
}

export interface Season {
  id: string
  name: string
  number: number
  description: string
  coverUrl: string
  startDate: string
  endDate: string
  episodeIds: string[]
  status: 'active' | 'planning' | 'completed'
  color: string
}

export interface TopicIdea {
  id: string
  title: string
  description: string
  tags: string[]
  source: string
  submittedBy: string
  votes: number
  status: 'backlog' | 'planned' | 'dropped'
  createdAt: string
  episodeId?: string
}

export interface MaterialAsset {
  id: string
  type: 'audio' | 'image' | 'video' | 'document' | 'other'
  name: string
  path: string
  size: string
  duration?: string
  resolution?: string
  episodeId?: string
  tags: string[]
  uploadedBy: string
  uploadedAt: string
  notes: string
}

export interface AppState {
  seasons: Season[]
  episodes: Episode[]
  members: Member[]
  guests: Guest[]
  topics: TopicIdea[]
  materials: MaterialAsset[]
}
