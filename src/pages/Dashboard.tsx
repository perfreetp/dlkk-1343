import { useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Tag,
  Badge,
  List,
  Empty,
  Button,
  Space,
  Tooltip,
  Typography,
} from 'antd'
import {
  Mic,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  CalendarClock,
  ChevronRight,
  Sparkles,
  Flame,
  Target,
  TrendingUp,
  Play,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { STATUS_CONFIG, formatDate, getDeadlineLabel, getProgress, initials, daysUntil } from '@/utils'
import type { Episode } from '@/types'

const { Title, Text } = Typography

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: any
  label: string
  value: number | string
  sub?: string
  color: string
  bg: string
}) {
  return (
    <Card className="card-hover !rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 20 } }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </Card>
  )
}

function EpisodeCard({ episode }: { episode: Episode }) {
  const members = useStore((s) => s.members)
  const guests = useStore((s) => s.guests)
  const season = useStore((s) => s.getSeasonById(episode.seasonId))
  const status = STATUS_CONFIG[episode.status]
  const progress = getProgress(episode)
  const deadline = getDeadlineLabel(episode.deadline)
  const episodeGuests = episode.guestIds.map((id) => guests.find((g) => g.id === id)!).filter(Boolean)
  const episodeMembers = episode.assigneeIds.map((id) => members.find((m) => m.id === id)!).filter(Boolean)
  const overdue = daysUntil(episode.deadline) < 0 && episode.status !== 'published' && episode.status !== 'archived'

  return (
    <Link to={`/episodes/${episode.id}`}>
      <Card
        className={`card-hover !rounded-2xl border-0 shadow-sm h-full !transition ${
          overdue ? 'ring-2 ring-red-400/50' : ''
        }`}
        styles={{ body: { padding: 0 } }}
      >
        <div
          className="h-24 rounded-t-2xl flex items-end p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${season?.color || '#4361ee'}dd 0%, ${season?.color || '#4361ee'}88 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)'
          }} />
          <div className="relative z-10 w-full">
            <div className="flex items-center justify-between mb-2">
              <Tag className="!rounded-full !px-3 !border-0 !bg-white/20 !text-white !backdrop-blur-sm backdrop-blur">
                S{season?.number} · EP{String(episode.number).padStart(3, '0')}
              </Tag>
              <Tag
                className="!rounded-full !px-3 !border-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: status.color }}
              >
                <span className="status-dot" style={{ background: status.dot }} />
                {status.label}
              </Tag>
            </div>
            <div className="text-white font-bold text-lg leading-snug line-clamp-2">
              {episode.title}
            </div>
          </div>
        </div>
        <div className="p-4">
          {episode.subtitle && (
            <div className="text-sm text-gray-500 mb-3 line-clamp-1">{episode.subtitle}</div>
          )}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">整体进度</span>
              <span className="text-xs font-semibold text-gray-700">{progress.pct}%</span>
            </div>
            <Progress
              percent={progress.pct}
              showInfo={false}
              size="small"
              strokeColor={{ '0%': status.color, '100%': status.dot }}
              trailColor="#f3f4f6"
            />
          </div>
          {episode.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {episode.topics.slice(0, 3).map((t) => (
                <Tag key={t} className="!rounded-lg !text-xs !mb-0">
                  {t}
                </Tag>
              ))}
              {episode.topics.length > 3 && (
                <Tag className="!rounded-lg !text-xs !mb-0">+{episode.topics.length - 3}</Tag>
              )}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {episodeMembers.slice(0, 3).map((m) => (
                  <Tooltip key={m.id} title={`${m.name} · ${m.role}`}>
                    <Avatar size={26} style={{ backgroundColor: m.color, fontSize: 11, border: '2px solid white' }}>
                      {initials(m.name)}
                    </Avatar>
                  </Tooltip>
                ))}
                {episodeGuests.slice(0, 2).map((g) => (
                  <Tooltip key={g.id} title={`嘉宾: ${g.name}`}>
                    <Avatar size={26} style={{ backgroundColor: '#f5f5f5', color: '#666', fontSize: 11, border: '2px solid white' }}>
                      {initials(g.name)}
                    </Avatar>
                  </Tooltip>
                ))}
              </div>
            </div>
            <Space size={4}>
              <CalendarClock size={14} style={{ color: deadline.color }} />
              <span className="text-xs font-medium" style={{ color: deadline.color }}>
                {deadline.text}
              </span>
            </Space>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function MemberTasks() {
  const members = useStore((s) => s.members)
  const getMemberEpisodes = useStore((s) => s.getMemberEpisodes)

  const memberStats = members.map((m) => {
    const eps = getMemberEpisodes(m.id)
    const todos = eps.reduce(
      (acc, e) => acc + e.editTodos.filter((t) => t.assigneeId === m.id && !t.done).length,
      0,
    )
    return { member: m, activeEps: eps.length, pendingTasks: todos }
  })

  return (
    <List
      className="member-task-list"
      dataSource={memberStats}
      renderItem={({ member, activeEps, pendingTasks }) => (
        <List.Item className="!px-0 !py-3 !border-b !border-gray-50 last:!border-0">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar size={40} style={{ backgroundColor: member.color, fontSize: 14 }}>
                {initials(member.name)}
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{member.name}</div>
                <div className="text-xs text-gray-500 truncate">{member.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-400">进行中</div>
                <div className="font-semibold text-gray-700">{activeEps} 期</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">待办</div>
                <Badge count={pendingTasks} size="small" offset={[0, 0]} style={{ backgroundColor: pendingTasks > 3 ? '#ef4444' : '#f59e0b' }} />
              </div>
            </div>
          </div>
        </List.Item>
      )}
    />
  )
}

function StatusOverview() {
  const episodes = useStore((s) => s.episodes)
  const active = episodes.filter((e) => e.seasonId === 's1')

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const status of ['idea', 'planning', 'recording', 'editing', 'reviewing', 'ready', 'published']) {
      c[status] = active.filter((e) => e.status === status).length
    }
    return c
  }, [active])

  const total = active.length
  const statuses = [
    { key: 'idea', icon: Sparkles },
    { key: 'planning', icon: Target },
    { key: 'recording', icon: Mic },
    { key: 'editing', icon: Zap },
    { key: 'reviewing', icon: AlertTriangle },
    { key: 'ready', icon: CheckCircle2 },
    { key: 'published', icon: TrendingUp },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {statuses.map(({ key, icon: Icon }) => {
        const count = counts[key] || 0
        const cfg = STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]
        return (
          <div
            key={key}
            className={`flex-shrink-0 px-4 py-3 rounded-xl border-0 transition-all ${
              count > 0 ? 'shadow-sm' : 'opacity-60'
            }`}
            style={{
              background: count > 0 ? 'white' : '#fafafa',
              border: `1px solid ${count > 0 ? '#e5e7eb' : '#f3f4f6'}`,
              minWidth: 110,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={15} style={{ color: cfg.color }} />
              <span className="text-xs font-medium" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{count}</span>
              <span className="text-xs text-gray-400">/ {total}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function UpcomingDeadlines() {
  const episodes = useStore((s) => s.episodes)
  const upcoming = [...episodes]
    .filter((e) => e.status !== 'published' && e.status !== 'archived')
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 5)

  if (upcoming.length === 0) return <Empty description="暂无截止任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />

  return (
    <List
      dataSource={upcoming}
      renderItem={(ep) => {
        const deadline = getDeadlineLabel(ep.deadline)
        const cfg = STATUS_CONFIG[ep.status]
        const overdue = daysUntil(ep.deadline) < 0
        return (
          <List.Item className="!px-0 !py-2.5 !border-b !border-gray-50 last:!border-0">
            <Link to={`/episodes/${ep.id}`} className="w-full block hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-dot" style={{ background: cfg.dot }} />
                    <span className="text-xs font-medium" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">{ep.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    S{ep.seasonId === 's1' ? 3 : ep.seasonId === 's2' ? 2 : 4} · EP{String(ep.number).padStart(3, '0')}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      overdue ? 'bg-red-50 text-red-600' : deadline.color === '#f59e0b' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {overdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                    {deadline.text}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(ep.deadline, 'MM月DD日')}
                  </div>
                </div>
              </div>
            </Link>
          </List.Item>
        )
      }}
    />
  )
}

function SeasonTabs() {
  const seasons = useStore((s) => s.seasons)
  const episodes = useStore((s) => s.episodes)

  return (
    <div className="flex flex-col gap-3">
      {seasons.map((s) => {
        const seasonEps = episodes.filter((e) => e.seasonId === s.id)
        const published = seasonEps.filter((e) => e.status === 'published' || e.status === 'archived').length
        const statusLabel = s.status === 'active' ? '进行中' : s.status === 'completed' ? '已完成' : '规划中'
        return (
          <div
            key={s.id}
            className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${
              s.status === 'active' ? 'border-primary-200 bg-primary-50/50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ background: s.color }}
                >
                  S{s.number}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </div>
              </div>
              <Tag
                color={s.status === 'active' ? 'blue' : s.status === 'completed' ? 'green' : 'gold'}
                className="!rounded-full"
              >
                {statusLabel}
              </Tag>
            </div>
            <div className="flex items-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-1 text-gray-600">
                <Play size={14} />
                <span>
                  <b className="text-gray-900">{published}</b> / {seasonEps.length} 已发布
                </span>
              </div>
              <div className="text-gray-500">
                {formatDate(s.startDate, 'MM/DD')} — {formatDate(s.endDate, 'MM/DD')}
              </div>
            </div>
            <Progress
              percent={seasonEps.length ? Math.round((published / Math.max(seasonEps.length, 1)) * 100) : 0}
              showInfo={false}
              size="small"
              className="!mt-3"
              strokeColor={s.color}
              trailColor="#e5e7eb"
            />
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const episodes = useStore((s) => s.episodes)
  const seasons = useStore((s) => s.seasons)
  const activeEpisodes = episodes.filter((e) => e.seasonId === 's1')

  const stats = useMemo(() => {
    const active = episodes.filter((e) => e.status !== 'published' && e.status !== 'archived')
    const thisWeek = episodes.filter((e) => e.publishedDate && new Date(e.publishedDate) >= new Date('2026-03-09')).length
    const totalListeners = 98520
    const overdue = active.filter((e) => daysUntil(e.deadline) < 0).length
    return { active, thisWeek, totalListeners, overdue }
  }, [episodes])

  const kanbanOrder = ['reviewing', 'ready', 'editing', 'recording', 'planning']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={3} className="!mb-0 !text-2xl">
            节目看板{' '}
            <Text type="secondary" className="!text-base !font-normal">
              {seasons.find((s) => s.status === 'active')?.name}
            </Text>
          </Title>
          <Text type="secondary">
            早上好，林小雨 · 今天有 {stats.overdue > 0 ? `${stats.overdue} 项已逾期，` : ''}
            {kanbanOrder.reduce((acc, k) => acc + activeEpisodes.filter((e) => e.status === k).length, 0)} 项正在推进中
          </Text>
        </div>
        <Space>
          <Link to="/episodes">
            <Button type="default" icon={<Mic />} size="large">
              新建单集
            </Button>
          </Link>
          <Link to="/calendar">
            <Button type="primary" icon={<CalendarClock />} size="large">
              查看排期
              <ChevronRight size={14} />
            </Button>
          </Link>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={Flame} label="本周上线" value={stats.thisWeek} sub={`本月目标 12 期`} color="#ef4444" bg="#fef2f2" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={Target} label="进行中" value={stats.active.length} sub="跨 3 个制作阶段" color="#4361ee" bg="#eef2ff" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={Users} label="累计收听" value={`${(stats.totalListeners / 10000).toFixed(1)}w`} sub="环比上周 +12.4%" color="#10b981" bg="#ecfdf5" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={AlertTriangle}
            label="已逾期"
            value={stats.overdue}
            sub={stats.overdue > 0 ? '请尽快处理' : '太棒了，暂无逾期'}
            color={stats.overdue > 0 ? '#dc2626' : '#6b7280'}
            bg={stats.overdue > 0 ? '#fef2f2' : '#f9fafb'}
          />
        </Col>
      </Row>

      <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 20 } }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="!mb-0">
            S3 制作状态总览
          </Title>
          <Button type="link" size="small">
            查看全部 <ChevronRight size={14} className="inline" />
          </Button>
        </div>
        <StatusOverview />
      </Card>

      <Row gutter={16}>
        <Col xs={24} xl={16}>
          <Card
            className="!rounded-2xl border-0 shadow-sm h-full"
            title={
              <div className="flex items-center justify-between w-full">
                <span className="!mb-0 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-primary-600 inline-block" />
                  进行中单集
                </span>
                <Tag color="blue">{activeEpisodes.filter((e) => e.status !== 'published' && e.status !== 'archived').length} 期</Tag>
              </div>
            }
            styles={{ body: { padding: 20 } }}
            extra={
              <Link to="/episodes">
                <Button type="text" size="small">
                  全部单集 <ChevronRight size={14} />
                </Button>
              </Link>
            }
          >
            <Row gutter={16}>
              {activeEpisodes
                .filter((e) => e.status !== 'archived')
                .sort((a, b) => a.deadline.localeCompare(b.deadline))
                .map((ep) => (
                  <Col key={ep.id} xs={24} md={12} xxl={8} className="mb-4">
                    <EpisodeCard episode={ep} />
                  </Col>
                ))}
              {activeEpisodes.length === 0 && (
                <Col span={24}>
                  <Empty description="正在准备新单集..." />
                </Col>
              )}
            </Row>
          </Card>
        </Col>
        <Col xs={24} xl={8} className="flex flex-col gap-4">
          <Card
            className="!rounded-2xl border-0 shadow-sm"
            title={
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-red-500 inline-block" />
                即将截止
              </span>
            }
            styles={{ body: { padding: 20 } }}
          >
            <UpcomingDeadlines />
          </Card>
          <Card
            className="!rounded-2xl border-0 shadow-sm"
            title={
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-green-500 inline-block" />
                团队成员
              </span>
            }
            styles={{ body: { padding: 20 } }}
          >
            <MemberTasks />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card
            className="!rounded-2xl border-0 shadow-sm h-full"
            title={
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-purple-500 inline-block" />
                节目季管理
              </span>
            }
            styles={{ body: { padding: 20 } }}
          >
            <SeasonTabs />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="!rounded-2xl border-0 shadow-sm h-full"
            title={
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-amber-500 inline-block" />
                选题池 · 热门 Top
              </span>
            }
            extra={
              <Link to="/episodes">
                <Button type="text" size="small">
                  选题池 <ChevronRight size={14} />
                </Button>
              </Link>
            }
            styles={{ body: { padding: 20 } }}
          >
            <List
              dataSource={useStore
                .getState()
                .topics.filter((t) => t.status !== 'dropped')
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 5)}
              renderItem={(t, idx) => (
                <List.Item className="!px-0 !py-3 !border-b !border-gray-50 last:!border-0">
                  <div className="w-full flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        idx === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                          : idx === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                          : idx === 2
                          ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{t.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag className="!text-xs !rounded !mb-0 !px-2" color="blue">
                          {t.source}
                        </Tag>
                        {t.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs text-gray-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-bold text-amber-600">🔥 {t.votes}</div>
                      <div className="text-xs text-gray-400">票</div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
