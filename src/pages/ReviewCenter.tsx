import { useState, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Tag,
  Avatar,
  Typography,
  Empty,
  Divider,
  Segmented,
  Modal,
  Form,
  Select,
  App as AntApp,
  List,
  Badge,
  Timeline,
  Tooltip,
  Rate,
  Progress,
  Checkbox,
} from 'antd'
import {
  Search,
  Plus,
  Filter,
  FileCheck,
  MessageSquare,
  Check,
  X,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Users,
  AlertCircle,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Calendar,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { formatDate, formatDateTime, initials, STATUS_CONFIG, getDeadlineLabel } from '@/utils'
import type { Episode, ReviewComment } from '@/types'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function ReviewCenter() {
  const episodes = useStore((s) => s.episodes)
  const members = useStore((s) => s.members)
  const addReviewComment = useStore((s) => s.addReviewComment)
  const resolveReview = useStore((s) => s.resolveReview)
  const updatePublishCheck = useStore((s) => s.updatePublishCheck)
  const { message } = AntApp.useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'reviewing' | 'ready' | 'pending'>('all')
  const [selectedEp, setSelectedEp] = useState<Episode | null>(null)
  const [replyText, setReplyText] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentTarget, setCommentTarget] = useState<string | null>(null)

  const reviewList = useMemo(() => {
    let list = episodes.filter(
      (e) =>
        e.status === 'reviewing' ||
        e.status === 'ready' ||
        e.reviews.length > 0 ||
        (e.editTodos.some((t) => !t.done) && e.recordings.length > 0),
    )
    if (statusFilter === 'reviewing') list = list.filter((e) => e.status === 'reviewing')
    else if (statusFilter === 'ready') list = list.filter((e) => e.status === 'ready')
    else if (statusFilter === 'pending')
      list = list.filter((e) => e.reviews.some((r) => !r.resolved))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) => e.title.toLowerCase().includes(q) || e.subtitle.toLowerCase().includes(q),
      )
    }
    return list
  }, [episodes, statusFilter, search])

  const stats = useMemo(() => {
    const reviewing = episodes.filter((e) => e.status === 'reviewing').length
    const ready = episodes.filter((e) => e.status === 'ready').length
    const unresolved = episodes.reduce(
      (acc, e) => acc + e.reviews.filter((r) => !r.resolved).length,
      0,
    )
    const totalReviews = episodes.reduce((acc, e) => acc + e.reviews.length, 0)
    return { reviewing, ready, unresolved, totalReviews }
  }, [episodes])

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    bg,
  }: {
    label: string
    value: number
    icon: any
    color: string
    bg: string
  }) => (
    <Card className="card-hover !rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-3xl font-bold mt-0.5" style={{ color }}>
            {value}
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </Card>
  )

  const memberById = (id: string) => members.find((m) => m.id === id)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Title level={3} className="!mb-0 !text-2xl">审核中心</Title>
          <Text type="secondary">集中处理所有单集的审核反馈，避免聊天记录里的意见被遗忘</Text>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={12} md={6}>
          <StatCard label="审核中" value={stats.reviewing} icon={AlertCircle} color="#ef4444" bg="#fef2f2" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard label="待发布" value={stats.ready} icon={FileCheck} color="#10b981" bg="#ecfdf5" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard label="待处理意见" value={stats.unresolved} icon={MessageSquare} color="#f59e0b" bg="#fef3c7" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard label="累计反馈" value={stats.totalReviews} icon={CheckCircle2} color="#4361ee" bg="#eef2ff" />
        </Col>
      </Row>

      <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: '12px 20px' } }}>
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <Input
            prefix={<Search size={16} className="text-gray-400" />}
            placeholder="搜索单集标题..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="large"
            className="!w-72"
            allowClear
          />
          <Segmented
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as any)}
            options={[
              { label: '全部', value: 'all' },
              { label: '审核中', value: 'reviewing' },
              { label: '待发布', value: 'ready' },
              { label: '有未解决', value: 'pending' },
            ]}
            size="small"
          />
        </div>
      </Card>

      <Row gutter={16}>
        <Col xs={24} xl={14}>
          {reviewList.length === 0 ? (
            <Card className="!rounded-2xl border-0 shadow-sm h-full flex items-center justify-center min-h-[400px]">
              <Empty description="暂无需审核的单集" />
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewList.map((ep) => {
                const cfg = STATUS_CONFIG[ep.status]
                const unresolved = ep.reviews.filter((r) => !r.resolved).length
                const total = ep.reviews.length
                const dl = getDeadlineLabel(ep.deadline)
                const pendingTodos = ep.editTodos.filter((t) => !t.done).length
                const selected = selectedEp?.id === ep.id
                return (
                  <Card
                    key={ep.id}
                    className={`card-hover !rounded-2xl border-0 shadow-sm cursor-pointer transition ${
                      selected ? 'ring-2 ring-primary-400' : ''
                    }`}
                    onClick={() => setSelectedEp(ep)}
                    styles={{ body: { padding: 20 } }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Tag
                            className="!rounded-full !text-xs !mb-0"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none' }}
                          >
                            <span className="status-dot" style={{ background: cfg.dot }} />
                            {cfg.label}
                          </Tag>
                          <Tag className="!rounded-full !text-xs !mb-0">
                            EP{String(ep.number).padStart(3, '0')}
                          </Tag>
                          {pendingTodos > 0 && (
                            <Tooltip title={`${pendingTodos} 项剪辑任务未完成`}>
                              <Tag color="gold" className="!rounded-full !text-xs !mb-0">
                                <Clock size={11} className="inline mr-1" />
                                {pendingTodos} 待办
                              </Tag>
                            </Tooltip>
                          )}
                        </div>
                        <Title level={5} className="!mb-0.5 !text-base line-clamp-1">
                          {ep.title}
                        </Title>
                        {ep.subtitle && (
                          <div className="text-sm text-gray-500 line-clamp-1">{ep.subtitle}</div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-400 mb-1 flex items-center justify-end gap-1">
                          <Calendar size={10} />
                          {formatDate(ep.scheduledDate, 'MM/DD')} 发布
                        </div>
                        <div className="text-xs font-medium" style={{ color: dl.color }}>
                          {dl.text}
                        </div>
                      </div>
                    </div>
                    <Divider className="!my-3" />
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <b>{total}</b> 条反馈
                          </span>
                          {unresolved > 0 && (
                            <Badge count={unresolved} size="small" style={{ backgroundColor: '#ef4444' }} />
                          )}
                        </div>
                        <div className="flex -space-x-1.5">
                          {ep.reviews.slice(0, 3).map((r) => {
                            const m = memberById(r.reviewerId)
                            return (
                              <Tooltip key={r.id} title={m?.name}>
                                <Avatar
                                  key={r.id}
                                  size={22}
                                  style={{ backgroundColor: m?.color, fontSize: 9, border: '2px solid white' }}
                                >
                                  {m?.name?.[0]}
                                </Avatar>
                              </Tooltip>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          type="link"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/episodes/${ep.id}`)
                          }}
                        >
                          打开单集 <ChevronRight size={12} />
                        </Button>
                      </div>
                    </div>
                    {ep.reviews.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-gray-50 pt-3">
                        {ep.reviews.slice(0, 2).map((r) => {
                          const reviewer = memberById(r.reviewerId)
                          return (
                            <div
                              key={r.id}
                              className={`flex items-start gap-3 p-2 rounded-lg ${
                                r.resolved ? 'opacity-60' : 'bg-amber-50/50'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Avatar
                                size={28}
                                style={{ backgroundColor: reviewer?.color, fontSize: 11 }}
                              >
                                {reviewer?.name?.[0]}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-medium text-gray-800">
                                    {reviewer?.name}
                                  </span>
                                  <span className="text-xs text-gray-400">{r.timestamp}</span>
                                  {r.resolved ? (
                                    <Tag color="green" className="!rounded-full !text-[10px] !mb-0 !py-0 !px-2">
                                      ✓ 已解决
                                    </Tag>
                                  ) : (
                                    <Tag color="red" className="!rounded-full !text-[10px] !mb-0 !py-0 !px-2">
                                      待处理
                                    </Tag>
                                  )}
                                </div>
                                <Paragraph
                                  className="!mb-0 !text-sm text-gray-700 !line-clamp-2"
                                  ellipsis={{ rows: 2 }}
                                >
                                  {r.content}
                                </Paragraph>
                              </div>
                            </div>
                          )
                        })}
                        {ep.reviews.length > 2 && (
                          <div className="text-xs text-gray-400 text-center pt-1">
                            还有 {ep.reviews.length - 2} 条反馈...
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </Col>

        <Col xs={24} xl={10}>
          {selectedEp ? (
            <div className="space-y-4 sticky top-0">
              <Card
                className="!rounded-2xl border-0 shadow-sm"
                title={
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded bg-gradient-to-b from-rose-400 to-red-600" />
                    审核意见
                    <Tag color="blue" className="!rounded-full !ml-2">
                      EP{String(selectedEp.number).padStart(3, '0')}
                    </Tag>
                  </div>
                }
                extra={
                  <Space>
                    <Button
                      size="small"
                      onClick={() => {
                        addReviewComment(selectedEp.id, {
                          reviewerId: members[0].id,
                          content: commentText || '整体通过，无重大问题，可以进入待发布状态。',
                          timestamp: formatDateTime(dayjs().toISOString()),
                          resolved: true,
                          replies: [],
                        })
                        setCommentText('')
                        message.success('已标记通过')
                      }}
                      type="primary"
                      icon={<CheckCircle2 size={14} />}
                      style={{ backgroundColor: '#10b981' }}
                    >
                      通过
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<XCircle size={14} />}
                      onClick={() => setCommentTarget('new')}
                    >
                      打回修改
                    </Button>
                  </Space>
                }
                styles={{ body: { padding: 0 } }}
              >
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <Title level={5} className="!mb-0 !text-sm !leading-snug">
                    {selectedEp.title}
                  </Title>
                </div>
                <div className="max-h-[420px] overflow-auto p-4 space-y-4">
                  {selectedEp.reviews.length === 0 ? (
                    <Empty description="暂无审核意见，点击右上角按钮提交第一条" />
                  ) : (
                    selectedEp.reviews.map((r) => {
                      const reviewer = memberById(r.reviewerId)
                      return (
                        <div key={r.id} className="space-y-2">
                          <div
                            className={`p-3 rounded-xl ${
                              r.resolved ? 'bg-green-50 border border-green-100' : 'bg-red-50/60 border border-red-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  size={28}
                                  style={{ backgroundColor: reviewer?.color, fontSize: 11 }}
                                >
                                  {reviewer?.name?.[0]}
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">
                                    {reviewer?.name}
                                    <span className="text-xs text-gray-400 font-normal ml-2">
                                      {r.timestamp}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Space size="small">
                                {!r.resolved && (
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Check size={12} />}
                                    onClick={() => resolveReview(selectedEp.id, r.id)}
                                    style={{ color: '#10b981' }}
                                  >
                                    已解决
                                  </Button>
                                )}
                                <Tag
                                  color={r.resolved ? 'green' : 'red'}
                                  className="!rounded-full !text-[10px] !mb-0"
                                >
                                  {r.resolved ? '✓ 已解决' : '待处理'}
                                </Tag>
                              </Space>
                            </div>
                            <Paragraph className="!mb-0 !text-sm text-gray-700 leading-relaxed">
                              {r.content}
                            </Paragraph>
                            {r.replies.length > 0 && (
                              <div className="mt-3 space-y-2 pl-10">
                                {r.replies.map((rp) => {
                                  const a = memberById(rp.authorId)
                                  return (
                                    <div
                                      key={rp.id}
                                      className="text-sm bg-white rounded-lg p-2.5 border border-gray-100"
                                    >
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="font-medium text-gray-700">{a?.name}</span>
                                        <span className="text-xs text-gray-400">· {rp.timestamp}</span>
                                      </div>
                                      <div className="text-gray-600">{rp.content}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <Input
                                size="small"
                                placeholder={`回复 ${reviewer?.name}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onPressEnter={() => {
                                  if (!replyText.trim()) return
                                  setReplyText('')
                                  message.success('回复已发送')
                                }}
                                className="max-w-xs"
                              />
                              <Button
                                type="text"
                                size="small"
                                icon={<Send size={12} />}
                                disabled={!replyText.trim()}
                              >
                                回复
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <TextArea
                    rows={3}
                    placeholder="写下你的审核意见..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="primary"
                      icon={<MessageSquare size={14} />}
                      disabled={!commentText.trim()}
                      onClick={() => {
                        addReviewComment(selectedEp.id, {
                          reviewerId: members[0].id,
                          content: commentText,
                          timestamp: formatDateTime(dayjs().toISOString()),
                          resolved: false,
                          replies: [],
                        })
                        setCommentText('')
                        message.success('审核意见已提交')
                      }}
                    >
                      提交意见
                    </Button>
                  </div>
                </div>
              </Card>

              <Card
                className="!rounded-2xl border-0 shadow-sm"
                title={
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded bg-gradient-to-b from-emerald-400 to-teal-600" />
                    发布检查清单
                  </div>
                }
              >
                <div className="space-y-2.5">
                  {[
                    { key: 'audioQuality', label: '音频质量检查（电平、爆音、降噪）', icon: CheckCircle2 },
                    { key: 'metadata', label: '元数据完整（标题、副标题、标签）', icon: FileCheck },
                    { key: 'coverArt', label: '封面图符合平台尺寸要求', icon: Eye },
                    { key: 'showNotes', label: 'Shownotes 和章节已撰写', icon: FileCheck },
                    { key: 'chapters', label: '章节标记已添加', icon: Clock },
                    { key: 'sponsorship', label: '赞助口播已确认并安排妥当', icon: Users },
                    { key: 'rssFeed', label: 'RSS Feed 校验通过', icon: Send },
                  ].map(({ key, label, icon: Icon }) => {
                    const checked = selectedEp.publishCheck[key as keyof typeof selectedEp.publishCheck] as boolean
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                          checked ? 'bg-green-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => updatePublishCheck(selectedEp.id, key as keyof Episode['publishCheck'], !checked)}
                      >
                        <Checkbox checked={checked} />
                        <Icon
                          size={16}
                          className={checked ? 'text-green-500' : 'text-gray-400'}
                        />
                        <span
                          className={`flex-1 text-sm ${
                            checked ? 'text-gray-500 line-through' : 'text-gray-700'
                          }`}
                        >
                          {label}
                        </span>
                        {checked && <Check size={16} className="text-green-500" />}
                      </div>
                    )
                  })}
                </div>
                <Divider className="!my-4" />
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">🎯 发布平台</div>
                  <div className="flex flex-wrap gap-2">
                    {['小宇宙', '苹果播客', 'Spotify', '喜马拉雅', '网易云音乐', 'QQ音乐'].map((p) => {
                      const inList = (selectedEp.publishCheck.platforms || []).includes(p)
                      return (
                        <Tag.CheckableTag
                          key={p}
                          checked={inList}
                          onChange={(v) => {
                            const curr = selectedEp.publishCheck.platforms || []
                            const next = v ? [...curr, p] : curr.filter((x) => x !== p)
                            updatePublishCheck(selectedEp.id, 'platforms', next)
                          }}
                          style={{ padding: '6px 12px', borderRadius: 999 }}
                        >
                          {p}
                        </Tag.CheckableTag>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="!rounded-2xl border-0 shadow-sm h-full flex items-center justify-center min-h-[500px]">
              <Empty description="从左侧选择一个单集查看审核详情" />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}
