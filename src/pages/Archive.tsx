import { useMemo, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Input,
  DatePicker,
  Select,
  Segmented,
  Table,
  Tag,
  Avatar,
  Button,
  Modal,
  Form,
  Progress,
  Descriptions,
  Empty,
  message,
  Badge,
  Divider,
  Tooltip,
} from 'antd'
import {
  Search,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  Calendar as CalendarIcon,
  PlayCircle,
  Award,
  FileText,
  Filter,
  Eye,
  Plus,
  Clock,
  Crown,
  Medal,
  Target,
  Archive as ArchiveIcon,
  Radio,
  Upload,
  Share2,
  FileDown,
  RefreshCw,
  Edit2,
  Trash2,
  ListOrdered,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts'
import type { ColumnsType } from 'antd/es/table'
import { useStore } from '@/store'
import { STATUS_CONFIG, formatDate, initials, getProgress } from '@/utils'
import type { Episode, ListenerData } from '@/types'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const COLORS = ['#4361ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function aggregateListenerData(episodes: Episode[]) {
  const dayMap: Record<string, ListenerData> = {}
  episodes.forEach((ep) => {
    ep.listenerData.forEach((d) => {
      if (!dayMap[d.date]) {
        dayMap[d.date] = { ...d }
      } else {
        dayMap[d.date].plays += d.plays
        dayMap[d.date].downloads += d.downloads
        dayMap[d.date].newSubs += d.newSubs
      }
    })
  })
  return Object.entries(dayMap)
    .sort((a, b) => {
      const na = parseInt(a[0].replace('Day ', ''))
      const nb = parseInt(b[0].replace('Day ', ''))
      return na - nb
    })
    .map(([date, data]) => ({ ...data, date }))
}

function EpisodeDetailModal({ episode, open, onClose, onEditData, onDeleteData }: {
  episode: Episode | null
  open: boolean
  onClose: () => void
  onEditData: (episodeId: string, data: ListenerData) => void
  onDeleteData: (episodeId: string, dataId: string) => void
}) {
  const getSeason = useStore((s) => s.getSeasonById)
  const getMember = useStore((s) => s.getMemberById)
  const getGuest = useStore((s) => s.getGuestById)
  if (!episode) return null
  const season = getSeason(episode.seasonId)
  const progress = getProgress(episode)
  const totalPlays = episode.listenerData.reduce((s, d) => s + d.plays, 0)
  const totalDownloads = episode.listenerData.reduce((s, d) => s + d.downloads, 0)
  const totalNewSubs = episode.listenerData.reduce((s, d) => s + d.newSubs, 0)
  const chartData = episode.listenerData

  return (
    <Modal open={open} onCancel={onClose} width={900} footer={null} title={null} className="!p-0" closeIcon={<Eye size={18} />}>
      <div className="-mx-6 -mt-6 mb-6">
        <div className="h-32 bg-gradient-to-br from-podcast-ink via-podcast-deep to-podcast-accent relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag color="blue" style={{ background: 'rgba(67,97,238,0.9)', border: 'none', color: 'white' }}>
                  {season?.name}
                </Tag>
                <Tag style={{ background: STATUS_CONFIG[episode.status].bg, color: STATUS_CONFIG[episode.status].color, border: 'none' }}>
                  {STATUS_CONFIG[episode.status].label}
                </Tag>
              </div>
              <div className="text-white text-xl font-bold">{episode.title}</div>
              <div className="text-white/70 text-sm mt-1">{episode.subtitle}</div>
            </div>
            <div className="text-right text-white">
              <div className="text-2xl font-bold">{totalPlays.toLocaleString()}</div>
              <div className="text-white/70 text-xs">总播放量</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <Row gutter={16}>
          <Col span={6}>
            <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '16px' } }}>
              <Statistic
                title={<span className="text-xs text-gray-500 flex items-center gap-1"><PlayCircle size={12} />总播放</span>}
                value={totalPlays}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: '#4361ee' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '16px' } }}>
              <Statistic
                title={<span className="text-xs text-gray-500 flex items-center gap-1"><Download size={12} />总下载</span>}
                value={totalDownloads}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '16px' } }}>
              <Statistic
                title={<span className="text-xs text-gray-500 flex items-center gap-1"><Users size={12} />新增订阅</span>}
                value={totalNewSubs}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '16px' } }}>
              <div className="text-xs text-gray-500 mb-2">制作完成度</div>
              <Progress type="circle" percent={progress.pct} size={60} strokeColor="#4361ee" />
            </Card>
          </Col>
        </Row>

        <Card title={<span className="font-semibold flex items-center gap-2"><BarChart3 size={16} />发布7日收听趋势</span>} className="!rounded-2xl !border-0 !shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} stroke="#9ca3af" />
              <YAxis fontSize={12} stroke="#9ca3af" />
              <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="plays" name="播放量" stroke="#4361ee" fillOpacity={1} fill="url(#colorPlays)" strokeWidth={2} />
              <Area type="monotone" dataKey="downloads" name="下载量" stroke="#10b981" fillOpacity={1} fill="url(#colorDownloads)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title={<span className="font-semibold flex items-center gap-2"><ListOrdered size={16} />收听数据明细</span>}
          className="!rounded-2xl !border-0 !shadow-sm"
        >
          <Table
            size="small"
            dataSource={episode.listenerData}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '时间节点', dataIndex: 'date', width: 120 },
              { title: '播放量', dataIndex: 'plays', width: 100, render: (v) => v.toLocaleString() },
              { title: '下载量', dataIndex: 'downloads', width: 100, render: (v) => v.toLocaleString() },
              { title: '新增订阅', dataIndex: 'newSubs', width: 100, render: (v) => v || 0 },
              { title: '平均收听', dataIndex: 'avgListen', width: 100 },
              { title: '跳出率', dataIndex: 'dropOff', width: 90, render: (v) => `${v || 0}%` },
              {
                title: '最近修改',
                dataIndex: 'updatedAt',
                width: 140,
                render: (v) => <span className="text-xs text-gray-500">{v}</span>,
              },
              {
                title: '操作',
                key: 'action',
                width: 120,
                render: (_, d) => (
                  <div className="flex gap-2">
                    <Button
                      type="link"
                      size="small"
                      icon={<Edit2 size={14} />}
                      onClick={() => onEditData(episode.id, d)}
                    >
                      编辑
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => onDeleteData(episode.id, d.id)}
                    >
                      删除
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <Descriptions column={2} size="small" bordered className="bg-white rounded-2xl overflow-hidden">
          <Descriptions.Item label="发布日期">{formatDate(episode.publishedDate)}</Descriptions.Item>
          <Descriptions.Item label="原定截止">{formatDate(episode.deadline)}</Descriptions.Item>
          <Descriptions.Item label="节目单集">EP{String(episode.number).padStart(3, '0')}</Descriptions.Item>
          <Descriptions.Item label="制作成员">
            <div className="flex -space-x-2">
              {episode.assigneeIds.map((id) => {
                const m = getMember(id)
                if (!m) return null
                return (
                  <Tooltip key={id} title={`${m.name} · ${m.role}`}>
                    <Avatar key={id} size={24} style={{ backgroundColor: m.color, border: '2px solid white', fontSize: 10 }}>
                      {initials(m.name)}
                    </Avatar>
                  </Tooltip>
                )
              })}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="本期嘉宾">
            <div className="flex flex-wrap gap-1">
              {episode.guestIds.length === 0 ? (
                <span className="text-gray-400">无</span>
              ) : (
                episode.guestIds.map((id) => {
                  const g = getGuest(id)
                  return g ? <Tag key={id} color="purple">{g.name}</Tag> : null
                })
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="话题标签">
            <div className="flex flex-wrap gap-1">
              {episode.topics.map((t) => (
                <Tag key={t} color="blue">{t}</Tag>
              ))}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="赞助口播" span={2}>
            {episode.sponsorSlots.length === 0 ? (
              <span className="text-gray-400">无</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {episode.sponsorSlots.map((sp) => (
                  <Tag key={sp.id} color="gold">
                    {sp.type === 'pre' ? '片头' : sp.type === 'mid' ? '片中' : '片尾'} · {sp.sponsor}
                  </Tag>
                ))}
              </div>
            )}
          </Descriptions.Item>
        </Descriptions>

        <div className="flex justify-end gap-2">
          <Button icon={<Download size={14} />}>导出收听报表</Button>
          <Button type="primary" icon={<FileText size={14} />}>查看制作记录</Button>
        </div>
      </div>
    </Modal>
  )
}

function AddDataModal({ open, onClose, episodes, onAdd }: {
  open: boolean
  onClose: () => void
  episodes: Episode[]
  onAdd: (episodeId: string, data: Omit<ListenerData, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [form] = Form.useForm()
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<span className="font-semibold flex items-center gap-2"><Plus size={16} />录入收听数据</span>}
      okText="保存"
      cancelText="取消"
      onOk={() => form.validateFields().then((v) => {
        onAdd(v.episodeId, {
          date: v.date,
          plays: Number(v.plays),
          downloads: Number(v.downloads),
          avgListen: v.avgListen || '00:00',
          newSubs: Number(v.newSubs || 0),
          dropOff: Number(v.dropOff || 0),
        })
        form.resetFields()
        message.success('收听数据已录入')
        onClose()
      })}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="episodeId" label="选择单集" rules={[{ required: true, message: '请选择单集' }]}>
          <Select placeholder="选择要录入数据的节目" options={episodes.map((e) => ({ label: e.title, value: e.id }))} />
        </Form.Item>
        <Form.Item name="date" label="时间节点" rules={[{ required: true, message: '请输入时间节点' }]}>
          <Input placeholder="如：Day 1 / 2026-03-10" />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="plays" label="播放量" rules={[{ required: true, message: '请输入播放量' }]}>
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="downloads" label="下载量" rules={[{ required: true, message: '请输入下载量' }]}>
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="newSubs" label="新增订阅">
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="avgListen" label="平均收听时长">
              <Input placeholder="如 38:20" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="dropOff" label="跳出率 (%)">
          <Input type="number" placeholder="0" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

function EditDataModal({ open, onClose, data, onSave }: {
  open: boolean
  onClose: () => void
  data: ListenerData
  onSave: (d: Partial<Omit<ListenerData, 'id' | 'createdAt' | 'updatedAt'>>) => void
}) {
  const [form] = Form.useForm()
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<span className="font-semibold flex items-center gap-2"><Edit2 size={16} />编辑收听数据</span>}
      okText="保存"
      cancelText="取消"
      onOk={() => form.validateFields().then((v) => {
        onSave({
          date: v.date,
          plays: Number(v.plays),
          downloads: Number(v.downloads),
          avgListen: v.avgListen || '00:00',
          newSubs: Number(v.newSubs || 0),
          dropOff: Number(v.dropOff || 0),
        })
        message.success('已更新')
        onClose()
      })}
      afterOpenChange={(visible) => {
        if (visible) {
          form.setFieldsValue({
            date: data.date,
            plays: data.plays,
            downloads: data.downloads,
            avgListen: data.avgListen,
            newSubs: data.newSubs,
            dropOff: data.dropOff,
          })
        }
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="date" label="时间节点" rules={[{ required: true, message: '请输入时间节点' }]}>
          <Input placeholder="如：Day 1 / 2026-03-10" />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="plays" label="播放量" rules={[{ required: true, message: '请输入播放量' }]}>
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="downloads" label="下载量" rules={[{ required: true, message: '请输入下载量' }]}>
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="newSubs" label="新增订阅">
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="avgListen" label="平均收听时长">
              <Input placeholder="如 38:20" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="dropOff" label="跳出率 (%)">
          <Input type="number" placeholder="0" />
        </Form.Item>
        <div className="text-xs text-gray-400 mt-2">创建于 {data.createdAt} · 最后修改 {data.updatedAt}</div>
      </Form>
    </Modal>
  )
}

export default function Archive() {
  const { episodes, seasons, members, getSeasonById, getMemberById, addListenerData, updateListenerData, deleteListenerData } = useStore()
  const [seasonFilter, setSeasonFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [chartMetric, setChartMetric] = useState<'plays' | 'downloads' | 'newSubs'>('plays')
  const [chartMode, setChartMode] = useState<'trend' | 'compare' | 'platform'>('trend')
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [addDataOpen, setAddDataOpen] = useState(false)
  const [editData, setEditData] = useState<{ episodeId: string; data: ListenerData } | null>(null)
  const editDataOpen = !!editData
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const publishedEpisodes = useMemo(() => {
    return episodes
      .filter((e) => e.status === 'published' || e.status === 'archived' || e.status === 'ready')
      .sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''))
  }, [episodes])

  const dateFilteredEpisodes = useMemo(() => {
    if (!dateRange) return publishedEpisodes
    const [start, end] = dateRange
    return publishedEpisodes.filter((e) => {
      if (!e.publishedDate) return false
      const d = dayjs(e.publishedDate)
      return d.isAfter(start.subtract(1, 'day')) && d.isBefore(end.add(1, 'day'))
    })
  }, [publishedEpisodes, dateRange])

  const filteredEpisodes = useMemo(() => {
    let result = dateFilteredEpisodes
    if (seasonFilter !== 'all') result = result.filter((e) => e.seasonId === seasonFilter)
    if (statusFilter !== 'all') result = result.filter((e) => e.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subtitle.toLowerCase().includes(q) ||
          e.topics.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return result
  }, [dateFilteredEpisodes, seasonFilter, statusFilter, searchQuery])

  const totalStats = useMemo(() => {
    let totalPlays = 0
    let totalDownloads = 0
    let totalNewSubs = 0
    dateFilteredEpisodes.forEach((ep) => {
      ep.listenerData.forEach((d) => {
        totalPlays += d.plays
        totalDownloads += d.downloads
        totalNewSubs += d.newSubs
      })
    })
    return { totalPlays, totalDownloads, totalNewSubs, totalEpisodes: dateFilteredEpisodes.length }
  }, [dateFilteredEpisodes])

  const trendData = useMemo(() => aggregateListenerData(dateFilteredEpisodes), [dateFilteredEpisodes])

  const topEpisodes = useMemo(() => {
    return [...dateFilteredEpisodes]
      .map((ep) => ({
        episode: ep,
        total: ep.listenerData.reduce((s, d) => s + d.plays, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [dateFilteredEpisodes])

  const seasonStats = useMemo(() => {
    return seasons
      .filter((s) => s.status !== 'planning')
      .map((s) => {
        const eps = dateFilteredEpisodes.filter((e) => e.seasonId === s.id)
        const plays = eps.reduce((sum, ep) => sum + ep.listenerData.reduce((s2, d) => s2 + d.plays, 0), 0)
        const downloads = eps.reduce((sum, ep) => sum + ep.listenerData.reduce((s2, d) => s2 + d.downloads, 0), 0)
        return { name: s.name, episodes: eps.length, plays, downloads, color: s.color }
      })
  }, [seasons, dateFilteredEpisodes])

  const memberContrib = useMemo(() => {
    return members.map((m) => {
      const count = dateFilteredEpisodes.filter((e) => e.assigneeIds.includes(m.id)).length
      return { name: m.name, episodes: count, color: m.color }
    }).sort((a, b) => b.episodes - a.episodes)
  }, [members, dateFilteredEpisodes])

  const handleAddData = (episodeId: string, data: Omit<ListenerData, 'id' | 'createdAt' | 'updatedAt'>) => {
    addListenerData(episodeId, data)
  }

  const handleUpdateData = (episodeId: string, dataId: string, data: Partial<Omit<ListenerData, 'id' | 'createdAt' | 'updatedAt'>>) => {
    updateListenerData(episodeId, dataId, data)
    setEditData(null)
  }

  const handleDeleteData = (episodeId: string, dataId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条收听数据吗？删除后相关统计会自动更新。',
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteListenerData(episodeId, dataId)
        message.success('已删除')
      },
    })
  }

  const columns: ColumnsType<Episode> = [
    {
      title: '节目',
      dataIndex: 'title',
      width: 320,
      render: (_, ep) => (
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
            style={{
              background: `linear-gradient(135deg, ${getSeasonById(ep.seasonId)?.color || '#4361ee'}, ${getSeasonById(ep.seasonId)?.color || '#4361ee'}99)`,
            }}
          >
            EP{String(ep.number).padStart(3, '0')}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate max-w-[220px]">{ep.title}</div>
            <div className="text-xs text-gray-500 truncate mt-0.5">{ep.subtitle}</div>
          </div>
        </div>
      ),
    },
    {
      title: '节目季',
      dataIndex: 'seasonId',
      width: 140,
      render: (id) => {
        const s = getSeasonById(id)
        return (
          <Tag color="blue" style={{ background: `${s?.color}15`, color: s?.color, border: 'none' }}>
            {s?.name.split(' · ')[0]}
          </Tag>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
        return (
          <Badge
            status={cfg.color as any}
            text={<span style={{ color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>}
          />
        )
      },
    },
    {
      title: '发布日期',
      dataIndex: 'publishedDate',
      width: 120,
      render: (d) => <span className="text-gray-700">{formatDate(d) || '待发布'}</span>,
      sorter: (a, b) => (a.publishedDate || '').localeCompare(b.publishedDate || ''),
    },
    {
      title: '播放量',
      width: 120,
      render: (_, ep) => {
        const total = ep.listenerData.reduce((s, d) => s + d.plays, 0)
        return <span className="font-semibold text-blue-600">{total.toLocaleString()}</span>
      },
      sorter: (a, b) => {
        const ta = a.listenerData.reduce((s, d) => s + d.plays, 0)
        const tb = b.listenerData.reduce((s, d) => s + d.plays, 0)
        return ta - tb
      },
    },
    {
      title: '下载量',
      width: 110,
      render: (_, ep) => {
        const total = ep.listenerData.reduce((s, d) => s + d.downloads, 0)
        return <span className="font-semibold text-emerald-600">{total.toLocaleString()}</span>
      },
    },
    {
      title: '新增订阅',
      width: 100,
      render: (_, ep) => {
        const total = ep.listenerData.reduce((s, d) => s + d.newSubs, 0)
        return <span className="font-semibold text-amber-600">+{total}</span>
      },
    },
    {
      title: '核心成员',
      width: 130,
      render: (_, ep) => (
        <div className="flex -space-x-2">
          {ep.assigneeIds.slice(0, 3).map((id) => {
            const m = getMemberById(id)
            if (!m) return null
            return (
              <Tooltip key={id} title={`${m.name} · ${m.role}`}>
                <Avatar size={26} style={{ backgroundColor: m.color, border: '2px solid white', fontSize: 10 }}>
                  {initials(m.name)}
                </Avatar>
              </Tooltip>
            )
          })}
          {ep.assigneeIds.length > 3 && (
            <Avatar size={26} style={{ backgroundColor: '#e5e7eb', color: '#6b7280', border: '2px solid white', fontSize: 10 }}>
              +{ep.assigneeIds.length - 3}
            </Avatar>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_, ep) => (
        <Button
          type="link"
          icon={<Eye size={14} />}
          onClick={() => {
            setSelectedEpisode(ep)
            setDetailOpen(true)
          }}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArchiveIcon size={24} className="text-primary-500" />
            统计归档
          </h1>
          <p className="text-sm text-gray-500 mt-1">节目数据沉淀与收听表现分析</p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<RefreshCw size={14} />}>同步平台数据</Button>
          <Button icon={<Upload size={14} />}>导入收听报表</Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setAddDataOpen(true)}>
            录入收听数据
          </Button>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                  <Radio size={14} /> 已发布节目
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalStats.totalEpisodes}</div>
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> 较上季 +3 期
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/10 flex items-center justify-center">
                <PlayCircle size={22} className="text-blue-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                  <BarChart3 size={14} /> 累计播放量
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalStats.totalPlays.toLocaleString()}</div>
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> +23.5% 环比
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-600/10 flex items-center justify-center">
                <TrendingUp size={22} className="text-indigo-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                  <Download size={14} /> 累计下载量
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalStats.totalDownloads.toLocaleString()}</div>
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> +18.2% 环比
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 flex items-center justify-center">
                <Download size={22} className="text-emerald-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="!rounded-2xl !border-0 !shadow-sm card-hover" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                  <Users size={14} /> 新增订阅
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalStats.totalNewSubs.toLocaleString()}</div>
                <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <TrendingDown size={12} /> -2.1% 环比
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/10 flex items-center justify-center">
                <Users size={22} className="text-amber-500" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold flex items-center gap-2">
              <BarChart3 size={16} />
              收听数据分析
            </span>
            <div className="flex items-center gap-3">
              <Segmented
                value={chartMode}
                onChange={(v) => setChartMode(v as any)}
                options={[
                  { label: '发布趋势', value: 'trend' },
                  { label: '节目季对比', value: 'compare' },
                  { label: '成员贡献', value: 'platform' },
                ]}
              />
              {chartMode === 'trend' && (
                <Segmented
                  value={chartMetric}
                  onChange={(v) => setChartMetric(v as any)}
                  options={[
                    { label: '播放量', value: 'plays' },
                    { label: '下载量', value: 'downloads' },
                    { label: '新增订阅', value: 'newSubs' },
                  ]}
                />
              )}
            </div>
          </div>
        }
        className="!rounded-2xl !border-0 !shadow-sm"
      >
        <ResponsiveContainer width="100%" height={320}>
          {chartMode === 'trend' ? (
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} stroke="#9ca3af" />
              <YAxis fontSize={12} stroke="#9ca3af" />
              <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Bar dataKey={chartMetric} name={chartMetric === 'plays' ? '播放量' : chartMetric === 'downloads' ? '下载量' : '新增订阅'} barSize={36} radius={[6, 6, 0, 0]}>
                {trendData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey={chartMetric}
                stroke="#4361ee"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4361ee', strokeWidth: 2, stroke: '#fff' }}
              />
            </ComposedChart>
          ) : chartMode === 'compare' ? (
            <BarChart data={seasonStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" />
              <YAxis fontSize={12} stroke="#9ca3af" />
              <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Bar dataKey="plays" name="播放量" radius={[6, 6, 0, 0]} barSize={30}>
                {seasonStats.map((s, index) => (
                  <Cell key={index} fill={s.color} />
                ))}
              </Bar>
              <Bar dataKey="downloads" name="下载量" radius={[6, 6, 0, 0]} barSize={30}>
                {seasonStats.map((s, index) => (
                  <Cell key={index} fill={`${s.color}88`} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={memberContrib}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={3}
                dataKey="episodes"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {memberContrib.map((m, index) => (
                  <Cell key={index} fill={m.color} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </Card>

      <Row gutter={16}>
        <Col span={16}>
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold flex items-center gap-2">
                  <Award size={16} />
                  热门节目排行榜 TOP 5
                </span>
                <Button size="small" icon={<FileDown size={12} />}>导出榜单</Button>
              </div>
            }
            className="!rounded-2xl !border-0 !shadow-sm"
          >
            <div className="space-y-3">
              {topEpisodes.map((item, index) => {
                const maxPlays = topEpisodes[0]?.total || 1
                const pct = Math.round((item.total / maxPlays) * 100)
                const MedalIcon = index === 0 ? Crown : index === 1 ? Medal : index === 2 ? Target : null
                const medalColor = index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#b45309' : '#6b7280'
                return (
                  <div
                    key={item.episode.id}
                    className="p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer card-hover border border-transparent"
                    onClick={() => {
                      setSelectedEpisode(item.episode)
                      setDetailOpen(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{
                          background: index < 3 ? `linear-gradient(135deg, ${medalColor}25, ${medalColor}15)` : '#f3f4f6',
                          color: medalColor,
                          border: index < 3 ? `1px solid ${medalColor}30` : 'none',
                        }}
                      >
                        {MedalIcon ? <MedalIcon size={18} /> : `#${index + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900 truncate pr-4">{item.episode.title}</div>
                          <div className="text-sm font-bold text-primary-600 flex-shrink-0">
                            {item.total.toLocaleString()} 次
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress
                            percent={pct}
                            showInfo={false}
                            strokeColor={medalColor}
                            size="small"
                            className="flex-1 !min-w-0"
                            style={{ width: '100%' }}
                          />
                          <span className="text-xs text-gray-500 flex-shrink-0 w-20 text-right">
                            {formatDate(item.episode.publishedDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title={<span className="font-semibold flex items-center gap-2"><Clock size={16} />节目季归档</span>}
            className="!rounded-2xl !border-0 !shadow-sm"
          >
            <div className="space-y-3">
              {seasons.filter((s) => s.status !== 'planning').map((s) => {
                const eps = publishedEpisodes.filter((e) => e.seasonId === s.id)
                const totalP = eps.reduce((sum, ep) => sum + ep.listenerData.reduce((s2, d) => s2 + d.plays, 0), 0)
                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl card-hover"
                    style={{
                      background: `linear-gradient(135deg, ${s.color}08, ${s.color}05)`,
                      border: `1px solid ${s.color}20`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: s.color }}
                        >
                          S{s.number}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                          <div className="text-xs text-gray-500">{formatDate(s.startDate)} ~ {formatDate(s.endDate)}</div>
                        </div>
                      </div>
                      <Tag color={s.status === 'completed' ? 'default' : 'processing'} style={{ border: 'none' }}>
                        {s.status === 'completed' ? '已完结' : '进行中'}
                      </Tag>
                    </div>
                    <Row gutter={8} className="mt-3">
                      <Col span={8}>
                        <div className="text-center p-2 rounded-lg bg-white/60">
                          <div className="text-xs text-gray-500">期数</div>
                          <div className="font-bold text-gray-900 text-sm mt-0.5">{eps.length}</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center p-2 rounded-lg bg-white/60">
                          <div className="text-xs text-gray-500">总播放</div>
                          <div className="font-bold text-primary-600 text-sm mt-0.5">{(totalP / 1000).toFixed(1)}k</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-center p-2 rounded-lg bg-white/60">
                          <div className="text-xs text-gray-500">平均</div>
                          <div className="font-bold text-emerald-600 text-sm mt-0.5">
                            {eps.length ? ((totalP / eps.length) / 1000).toFixed(1) : 0}k
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold flex items-center gap-2">
              <FileText size={16} />
              节目归档列表
            </span>
            <div className="flex items-center gap-2">
              <Button icon={<FileDown size={14} />}>批量导出</Button>
            </div>
          </div>
        }
        className="!rounded-2xl !border-0 !shadow-sm"
        extra={
          <div className="flex items-center gap-3 -mr-2">
            <Select
              value={seasonFilter}
              onChange={setSeasonFilter}
              style={{ width: 160 }}
              placeholder="节目季"
              options={[
                { label: '全部节目季', value: 'all' },
                ...seasons.map((s) => ({ label: s.name, value: s.id })),
              ]}
              prefix={<Filter size={12} className="text-gray-400 mr-1" />}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 130 }}
              options={[
                { label: '全部状态', value: 'all' },
                { label: '已发布', value: 'published' },
                { label: '待发布', value: 'ready' },
                { label: '已归档', value: 'archived' },
              ]}
            />
            <RangePicker
              value={dateRange as any}
              onChange={(v) => setDateRange(v as any)}
              size="middle"
              placeholder={['开始日期', '结束日期']}
              suffixIcon={<CalendarIcon size={14} />}
            />
            <Input
              prefix={<Search size={16} className="text-gray-400" />}
              placeholder="搜索节目名、话题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!w-64"
              allowClear
            />
          </div>
        }
      >
        {filteredEpisodes.length === 0 ? (
          <Empty description="暂无匹配的归档节目" style={{ padding: '40px 0' }} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredEpisodes}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 期节目`,
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      <EpisodeDetailModal
        episode={selectedEpisode}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEditData={(epId, data) => { setEditData({ episodeId: epId, data }) }}
        onDeleteData={handleDeleteData}
      />
      <AddDataModal open={addDataOpen} onClose={() => setAddDataOpen(false)} episodes={episodes} onAdd={handleAddData} />
      {editData && (
        <EditDataModal
          open={editDataOpen}
          onClose={() => setEditData(null)}
          data={editData.data}
          onSave={(d) => handleUpdateData(editData.episodeId, editData.data.id, d)}
        />
      )}
    </div>
  )
}
