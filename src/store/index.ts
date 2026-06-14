import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import dayjs from 'dayjs'
import type {
  AppState,
  Episode,
  EpisodeStatus,
  TopicIdea,
  ReviewComment,
  EditTodo,
  ClipMarker,
  OutlineItem,
  ListenerData,
  ActivityAction,
  ActivityLog,
  EpisodeGuestInfo,
} from '@/types'
import { mockInitialState } from '@/data/mock'

const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss')

interface StoreState extends AppState {
  selectedEpisodeId: string | null
  setSelectedEpisode: (id: string | null) => void

  getSeasonById: (id: string) => AppState['seasons'][number] | undefined
  getEpisodeById: (id: string) => Episode | undefined
  getEpisodesBySeason: (seasonId: string) => Episode[]
  getEpisodesByStatus: (status: EpisodeStatus) => Episode[]
  getMemberById: (id: string) => AppState['members'][number] | undefined
  getGuestById: (id: string) => AppState['guests'][number] | undefined
  getMemberEpisodes: (memberId: string) => Episode[]

  updateEpisodeStatus: (episodeId: string, status: EpisodeStatus, memberId?: string) => void
  addTopic: (topic: Omit<TopicIdea, 'id' | 'createdAt' | 'votes' | 'status'>) => void
  voteTopic: (topicId: string) => void
  setTopicStatus: (topicId: string, status: TopicIdea['status']) => void

  addReviewComment: (episodeId: string, comment: Omit<ReviewComment, 'id'>, memberId?: string) => void
  resolveReview: (episodeId: string, commentId: string, memberId?: string) => void
  toggleEditTodo: (episodeId: string, todoId: string, memberId?: string) => void
  toggleOutline: (episodeId: string, outlineId: string, memberId?: string) => void
  toggleMistake: (episodeId: string, mistakeId: string, memberId?: string) => void

  addOutlineItem: (episodeId: string, item: Omit<OutlineItem, 'id' | 'done' | 'createdAt' | 'updatedAt'>, memberId?: string) => void
  updateOutlineItem: (episodeId: string, outlineId: string, item: Partial<Omit<OutlineItem, 'id' | 'createdAt'>>, memberId?: string) => void
  deleteOutlineItem: (episodeId: string, outlineId: string, memberId?: string) => void

  addEditTodo: (episodeId: string, todo: Omit<EditTodo, 'id' | 'createdAt' | 'updatedAt'>, memberId?: string) => void
  updateEditTodo: (episodeId: string, todoId: string, todo: Partial<Omit<EditTodo, 'id' | 'createdAt'>>, memberId?: string) => void
  deleteEditTodo: (episodeId: string, todoId: string, memberId?: string) => void

  addGuestToEpisode: (episodeId: string, guestId: string, memberId?: string) => void
  removeGuestFromEpisode: (episodeId: string, guestId: string, memberId?: string) => void
  updateGuestInfo: (episodeId: string, guestId: string, info: Partial<Omit<EpisodeGuestInfo, 'guestId' | 'createdAt'>>, memberId?: string) => void

  addListenerData: (episodeId: string, data: Omit<ListenerData, 'id' | 'createdAt' | 'updatedAt'>, memberId?: string) => void
  updateListenerData: (episodeId: string, dataId: string, data: Partial<Omit<ListenerData, 'id' | 'createdAt'>>, memberId?: string) => void
  deleteListenerData: (episodeId: string, dataId: string, memberId?: string) => void

  updatePublishCheck: (episodeId: string, key: keyof Episode['publishCheck'], value: any, memberId?: string) => void
  updatePublishedDate: (episodeId: string, date: string | null, memberId?: string) => void

  approveReview: (episodeId: string, commentId: string, memberId?: string) => void
  rejectReview: (episodeId: string, commentId: string, memberId?: string) => void

  addActivityLog: (episodeId: string, action: ActivityAction, memberId: string, detail: string, meta?: Record<string, any>) => void

  searchEpisodes: (query: string) => Episode[]
  searchGuests: (query: string) => AppState['guests']
  searchMaterials: (query: string) => AppState['materials']

  resetToMock: () => void
}

const addLog = (
  episodes: Episode[],
  episodeId: string,
  action: ActivityAction,
  memberId: string,
  detail: string,
  meta?: Record<string, any>,
): Episode[] =>
  episodes.map((e) =>
    e.id === episodeId
      ? {
          ...e,
          updatedAt: now(),
          activityLog: [
            ...e.activityLog,
            {
              id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              action,
              memberId: memberId || 'm1',
              timestamp: now(),
              detail,
              meta,
            },
          ],
        }
      : e,
  )

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...mockInitialState,
      selectedEpisodeId: null,

      setSelectedEpisode: (id) => set({ selectedEpisodeId: id }),

      getSeasonById: (id) => get().seasons.find((s) => s.id === id),
      getEpisodeById: (id) => get().episodes.find((e) => e.id === id),
      getEpisodesBySeason: (seasonId) =>
        get()
          .episodes.filter((e) => e.seasonId === seasonId)
          .sort((a, b) => a.number - b.number),
      getEpisodesByStatus: (status) => get().episodes.filter((e) => e.status === status),
      getMemberById: (id) => get().members.find((m) => m.id === id),
      getGuestById: (id) => get().guests.find((g) => g.id === id),
      getMemberEpisodes: (memberId) =>
        get()
          .episodes.filter((e) => e.assigneeIds.includes(memberId))
          .filter((e) => e.status !== 'archived' && e.status !== 'published'),

      addActivityLog: (episodeId, action, memberId, detail, meta) =>
        set((state) => ({
          episodes: addLog(state.episodes, episodeId, action, memberId, detail, meta),
        })),

      updateEpisodeStatus: (episodeId, status, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId ? { ...e, status, updatedAt: now() } : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'status_change',
              memberId,
              `状态变更：${status}`,
              { status },
            ),
          }
        }),

      addTopic: (topic) =>
        set((state) => ({
          topics: [
            ...state.topics,
            {
              ...topic,
              id: `t${Date.now()}`,
              createdAt: now().split(' ')[0],
              votes: 0,
              status: 'backlog' as const,
            },
          ],
        })),

      voteTopic: (topicId) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === topicId ? { ...t, votes: t.votes + 1 } : t)),
        })),

      setTopicStatus: (topicId, status) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === topicId ? { ...t, status } : t)),
        })),

      addReviewComment: (episodeId, comment, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, reviews: [...e.reviews, { ...comment, id: `rv${Date.now()}` }] }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'review_added',
              memberId,
              '新增审核意见',
            ),
          }
        }),

      resolveReview: (episodeId, commentId, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  reviews: e.reviews.map((r) =>
                    r.id === commentId ? { ...r, resolved: true } : r,
                  ),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'review_resolved',
              memberId,
              '审核意见已解决',
            ),
          }
        }),

      toggleEditTodo: (episodeId, todoId, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  editTodos: e.editTodos.map((t) =>
                    t.id === todoId
                      ? { ...t, done: !t.done, updatedAt: now() }
                      : t,
                  ),
                }
              : e,
          )
          const ep = episodes.find((e) => e.id === episodeId)
          const todo = ep?.editTodos.find((t) => t.id === todoId)
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'edit_todo_toggled',
              memberId,
              `剪辑待办「${todo?.content?.slice(0, 20)}...」${todo?.done ? '完成' : '重新打开'}`,
            ),
          }
        }),

      toggleOutline: (episodeId, outlineId, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  outline: e.outline.map((o) =>
                    o.id === outlineId
                      ? { ...o, done: !o.done, updatedAt: now() }
                      : o,
                  ),
                }
              : e,
          )
          const ep = episodes.find((e) => e.id === episodeId)
          const item = ep?.outline.find((o) => o.id === outlineId)
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'outline_toggled',
              memberId,
              `提纲「${item?.title}」${item?.done ? '已完成' : '重新打开'}`,
            ),
          }
        }),

      toggleMistake: (episodeId, mistakeId, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  mistakes: e.mistakes.map((m) =>
                    m.id === mistakeId ? { ...m, fixed: !m.fixed } : m,
                  ),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'mistake_toggled',
              memberId,
              `口误标记状态变更`,
            ),
          }
        }),

      addOutlineItem: (episodeId, item, memberId = 'm1') =>
        set((state) => {
          const newItem: OutlineItem = {
            ...item,
            id: `o${Date.now()}`,
            done: false,
            createdAt: now(),
            updatedAt: now(),
          }
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, outline: [...e.outline, newItem] }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'outline_added',
              memberId,
              `新增提纲：${item.title}`,
            ),
          }
        }),

      updateOutlineItem: (episodeId, outlineId, item, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  outline: e.outline.map((o) =>
                    o.id === outlineId ? { ...o, ...item, updatedAt: now() } : o,
                  ),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'outline_updated',
              memberId,
              `更新提纲：${item.title || '内容'}`,
            ),
          }
        }),

      deleteOutlineItem: (episodeId, outlineId, memberId = 'm1') =>
        set((state) => {
          const ep = state.episodes.find((e) => e.id === episodeId)
          const item = ep?.outline.find((o) => o.id === outlineId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, outline: e.outline.filter((o) => o.id !== outlineId) }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'outline_deleted',
              memberId,
              `删除提纲：${item?.title}`,
            ),
          }
        }),

      addEditTodo: (episodeId, todo, memberId = 'm1') =>
        set((state) => {
          const newTodo: EditTodo = {
            ...todo,
            id: `et${Date.now()}`,
            createdAt: now(),
            updatedAt: now(),
          }
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, editTodos: [...e.editTodos, newTodo] }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'edit_todo_added',
              memberId,
              `新增剪辑待办：${todo.content.slice(0, 20)}...`,
            ),
          }
        }),

      updateEditTodo: (episodeId, todoId, todo, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  editTodos: e.editTodos.map((t) =>
                    t.id === todoId ? { ...t, ...todo, updatedAt: now() } : t,
                  ),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'edit_todo_updated',
              memberId,
              `更新剪辑待办`,
            ),
          }
        }),

      deleteEditTodo: (episodeId, todoId, memberId = 'm1') =>
        set((state) => {
          const ep = state.episodes.find((e) => e.id === episodeId)
          const todo = ep?.editTodos.find((t) => t.id === todoId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, editTodos: e.editTodos.filter((t) => t.id !== todoId) }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'edit_todo_deleted',
              memberId,
              `删除剪辑待办：${todo?.content.slice(0, 20)}...`,
            ),
          }
        }),

      addGuestToEpisode: (episodeId, guestId, memberId = 'm1') =>
        set((state) => {
          const guest = get().getGuestById(guestId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId && !e.guestIds.includes(guestId)
              ? {
                  ...e,
                  guestIds: [...e.guestIds, guestId],
                  guestInfo: [
                    ...e.guestInfo,
                    {
                      guestId,
                      role: '',
                      status: 'pending' as const,
                      reminder: '',
                      notes: '',
                      createdAt: now(),
                      updatedAt: now(),
                    },
                  ],
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'guest_added',
              memberId,
              `邀请嘉宾：${guest?.name}`,
            ),
          }
        }),

      removeGuestFromEpisode: (episodeId, guestId, memberId = 'm1') =>
        set((state) => {
          const guest = get().getGuestById(guestId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  guestIds: e.guestIds.filter((id) => id !== guestId),
                  guestInfo: e.guestInfo.filter((gi) => gi.guestId !== guestId),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'guest_removed',
              memberId,
              `移除嘉宾：${guest?.name}`,
            ),
          }
        }),

      updateGuestInfo: (episodeId, guestId, info, memberId = 'm1') =>
        set((state) => {
          const guest = get().getGuestById(guestId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  guestInfo: e.guestInfo.map((gi) =>
                    gi.guestId === guestId
                      ? { ...gi, ...info, updatedAt: now() }
                      : gi,
                  ),
                }
              : e,
          )
          const changes = Object.keys(info)
            .filter((k) => k !== 'updatedAt')
            .join('、')
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'guest_updated',
              memberId,
              `更新嘉宾「${guest?.name}」信息：${changes}`,
            ),
          }
        }),

      updatePublishedDate: (episodeId, date, memberId = 'm1') =>
        set((state) => {
          const ep = state.episodes.find((e) => e.id === episodeId)
          const oldDate = ep?.publishedDate || '(未设置)'
          const newDate = date || '(清空)'
          const episodes = state.episodes.map((e) =>
            e.id === episodeId ? { ...e, publishedDate: date } : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'published_date_changed',
              memberId,
              `发布日期调整：${oldDate} → ${newDate}`,
            ),
          }
        }),

      approveReview: (episodeId, commentId, memberId = 'm1') =>
        set((state) => {
          const ep = state.episodes.find((e) => e.id === episodeId)
          const comment = ep?.reviews.find((c: ReviewComment) => c.id === commentId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  reviews: e.reviews.map((c: ReviewComment) =>
                    c.id === commentId
                      ? { ...c, resolved: true, resolution: 'approved' as const }
                      : c,
                  ),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'review_approved',
              memberId,
              `审核通过：${comment?.content?.slice(0, 30) || ''}${(comment?.content?.length || 0) > 30 ? '...' : ''}`,
            ),
          }
        }),

      rejectReview: (episodeId, commentId, memberId = 'm1') =>
        set((state) => {
          const ep = state.episodes.find((e) => e.id === episodeId)
          const comment = ep?.reviews.find((c: ReviewComment) => c.id === commentId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  reviews: e.reviews.map((c: ReviewComment) =>
                    c.id === commentId
                      ? { ...c, resolved: true, resolution: 'rejected' as const }
                      : c,
                  ),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'review_rejected',
              memberId,
              `打回修改：${comment?.content?.slice(0, 30) || ''}${(comment?.content?.length || 0) > 30 ? '...' : ''}`,
            ),
          }
        }),

      addListenerData: (episodeId, data, memberId = 'm1') =>
        set((state) => {
          const newData: ListenerData = {
            ...data,
            id: `ld${Date.now()}`,
            createdAt: now(),
            updatedAt: now(),
          }
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, listenerData: [...e.listenerData, newData] }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'listener_data_added',
              memberId,
              `新增收听数据：${data.date}，播放 ${data.plays}`,
            ),
          }
        }),

      updateListenerData: (episodeId, dataId, data, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  listenerData: e.listenerData.map((d) =>
                    d.id === dataId ? { ...d, ...data, updatedAt: now() } : d,
                  ),
                }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'listener_data_updated',
              memberId,
              `更新收听数据：${data.date}`,
            ),
          }
        }),

      deleteListenerData: (episodeId, dataId, memberId = 'm1') =>
        set((state) => {
          const ep = state.episodes.find((e) => e.id === episodeId)
          const d = ep?.listenerData.find((x) => x.id === dataId)
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, listenerData: e.listenerData.filter((x) => x.id !== dataId) }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'listener_data_deleted',
              memberId,
              `删除收听数据：${d?.date}`,
            ),
          }
        }),

      updatePublishCheck: (episodeId, key, value, memberId = 'm1') =>
        set((state) => {
          const episodes = state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, publishCheck: { ...e.publishCheck, [key]: value } }
              : e,
          )
          return {
            episodes: addLog(
              episodes,
              episodeId,
              'publish_check_updated',
              memberId,
              `发布检查：${String(key)} ${value ? '✓' : '✗'}`,
            ),
          }
        }),

      searchEpisodes: (query) => {
        const q = query.toLowerCase()
        return get().episodes.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.subtitle.toLowerCase().includes(q) ||
            e.topics.some((t) => t.toLowerCase().includes(q)),
        )
      },

      searchGuests: (query) => {
        const q = query.toLowerCase()
        return get().guests.filter(
          (g) =>
            g.name.toLowerCase().includes(q) ||
            g.title.toLowerCase().includes(q) ||
            g.company.toLowerCase().includes(q) ||
            g.tags.some((t) => t.toLowerCase().includes(q)),
        )
      },

      searchMaterials: (query) => {
        const q = query.toLowerCase()
        return get().materials.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.tags.some((t) => t.toLowerCase().includes(q)) ||
            m.type.toLowerCase().includes(q),
        )
      },

      resetToMock: () => {
        set({ ...mockInitialState, selectedEpisodeId: null })
      },
    }),
    {
      name: 'podcast-studio-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        episodes: state.episodes,
        topics: state.topics,
        seasons: state.seasons,
        guests: state.guests,
        materials: state.materials,
        members: state.members,
      }),
    },
  ),
)
