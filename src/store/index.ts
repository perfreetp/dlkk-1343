import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
} from '@/types'
import { mockInitialState } from '@/data/mock'

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

  updateEpisodeStatus: (episodeId: string, status: EpisodeStatus) => void
  addTopic: (topic: Omit<TopicIdea, 'id' | 'createdAt' | 'votes' | 'status'>) => void
  voteTopic: (topicId: string) => void
  setTopicStatus: (topicId: string, status: TopicIdea['status']) => void

  addReviewComment: (episodeId: string, comment: Omit<ReviewComment, 'id'>) => void
  resolveReview: (episodeId: string, commentId: string) => void
  toggleEditTodo: (episodeId: string, todoId: string) => void
  toggleOutline: (episodeId: string, outlineId: string) => void
  toggleMistake: (episodeId: string, mistakeId: string) => void

  addOutlineItem: (episodeId: string, item: Omit<OutlineItem, 'id' | 'done'>) => void
  addEditTodo: (episodeId: string, todo: Omit<EditTodo, 'id'>) => void
  addGuestToEpisode: (episodeId: string, guestId: string) => void
  removeGuestFromEpisode: (episodeId: string, guestId: string) => void
  addListenerData: (episodeId: string, data: ListenerData) => void

  updatePublishCheck: (episodeId: string, key: keyof Episode['publishCheck'], value: any) => void

  searchEpisodes: (query: string) => Episode[]
  searchGuests: (query: string) => AppState['guests']
  searchMaterials: (query: string) => AppState['materials']

  resetToMock: () => void
}

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

      updateEpisodeStatus: (episodeId, status) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, status, updatedAt: new Date().toISOString().split('T')[0] }
              : e,
          ),
        })),

      addTopic: (topic) =>
        set((state) => ({
          topics: [
            ...state.topics,
            {
              ...topic,
              id: `t${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
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

      addReviewComment: (episodeId, comment) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, reviews: [...e.reviews, { ...comment, id: `rv${Date.now()}` }] }
              : e,
          ),
        })),

      resolveReview: (episodeId, commentId) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  reviews: e.reviews.map((r) =>
                    r.id === commentId ? { ...r, resolved: true } : r,
                  ),
                }
              : e,
          ),
        })),

      toggleEditTodo: (episodeId, todoId) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  editTodos: e.editTodos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)),
                }
              : e,
          ),
        })),

      toggleOutline: (episodeId, outlineId) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  outline: e.outline.map((o) => (o.id === outlineId ? { ...o, done: !o.done } : o)),
                }
              : e,
          ),
        })),

      toggleMistake: (episodeId, mistakeId) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  mistakes: e.mistakes.map((m) =>
                    m.id === mistakeId ? { ...m, fixed: !m.fixed } : m,
                  ),
                }
              : e,
          ),
        })),

      addOutlineItem: (episodeId, item) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  outline: [...e.outline, { ...item, id: `o${Date.now()}`, done: false }],
                }
              : e,
          ),
        })),

      addEditTodo: (episodeId, todo) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? {
                  ...e,
                  editTodos: [...e.editTodos, { ...todo, id: `et${Date.now()}` }],
                }
              : e,
          ),
        })),

      addGuestToEpisode: (episodeId, guestId) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId && !e.guestIds.includes(guestId)
              ? { ...e, guestIds: [...e.guestIds, guestId] }
              : e,
          ),
        })),

      removeGuestFromEpisode: (episodeId, guestId) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, guestIds: e.guestIds.filter((id) => id !== guestId) }
              : e,
          ),
        })),

      addListenerData: (episodeId, data) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, listenerData: [...e.listenerData, data] }
              : e,
          ),
        })),

      updatePublishCheck: (episodeId, key, value) =>
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === episodeId
              ? { ...e, publishCheck: { ...e.publishCheck, [key]: value } }
              : e,
          ),
        })),

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
