import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layout,
  Tabs,
  Card,
  Checkbox,
  Select,
  Button,
  Tag,
  Avatar,
  Badge,
  Progress,
  Form,
  Input,
  Table,
  List,
  Modal,
  Timeline,
  Descriptions,
  Typography,
  Empty,
  Divider,
  Upload,
  Rate,
  App as AntApp,
  Tooltip,
  Segmented,
  Radio,
  Row,
  Col,
  Space,
  DatePicker,
  Steps,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  Lightbulb,
  User,
  FileText,
  Mic,
  Upload as UploadIcon,
  Bookmark,
  AlertCircle,
  CheckSquare,
  Music,
  Image,
  Edit3,
  Clock,
  Send,
  Search,
  Plus,
  Star,
  MoreHorizontal,
  Trash2,
  Check,
  CalendarClock,
  Calendar,
  History,
  FolderOpen,
  ListOrdered,
  Activity,
  MessageSquare,
  CheckCircle,
  UserPlus,
  UserMinus,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react'
import { useStore } from '@/store'
import {
  STATUS_CONFIG,
  STATUS_FLOW,
  formatDate,
  getDeadlineLabel,
  getProgress,
  initials,
  PRIORITY_CONFIG,
  CLIP_TYPE_LABEL,
} from '@/utils'
import type {
  Episode,
  EpisodeStatus,
  Guest,
  TopicIdea,
  RecordingItem,
  MaterialAsset,
  EditTodo,
  ClipMarker,
  MusicItem,
  Priority,
  OutlineItem,
} from '@/types'
import dayjs from 'dayjs'

const { Sider, Content } = Layout
const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const WORK_TABS = [
  { key: 'topic', label: '选题池', icon: Lightbulb, desc: '头脑风暴 & 投票' },
  { key: 'guest', label: '嘉宾资料', icon: User, desc: '嘉宾信息档案' },
  { key: 'outline', label: '采访提纲', icon: FileText, desc: '时间线 & 要点' },
  { key: 'recording', label: '录音清单', icon: Mic, desc: '音轨管理' },
  { key: 'material', label: '素材导入', icon: UploadIcon, desc: '文件资源' },
  { key: 'clip', label: '片段标记', icon: Bookmark, desc: '高光 / 金句' },
  { key: 'mistake', label: '口误记录', icon: AlertCircle, desc: '待修正问题' },
  { key: 'edit', label: '剪辑待办', icon: CheckSquare, desc: '任务分配' },
  { key: 'music', label: '版权音乐', icon: Music, desc: 'BGM / 授权' },
  { key: 'cover', label: '封面草稿', icon: Image, desc: '设计版本' },
  { key: 'copy', label: '文案编辑', icon: Edit3, desc: 'Shownotes' },
  { key: 'timeline', label: '时间轴备注', icon: Clock, desc: '剪辑指导' },
  { key: 'activity', label: '制作记录', icon: Activity, desc: '操作历史' },
]

function EpisodeSidebar({
  episodes,
  selectedId,
  onSelect,
}: {
  episodes: Episode[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [filter, setFilter] = useState<EpisodeStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    let list = episodes
    if (filter !== 'all') list = list.filter((e) => e.status === filter)
    if (search)
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.subtitle.toLowerCase().includes(search.toLowerCase()),
      )
    return list.sort((a, b) => a.deadline.localeCompare(b.deadline))
  }, [episodes, filter, search])

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="!mb-0">全部单集</Title>
          <Button type="primary" size="small" icon={<Plus size={14} />}>新建</Button>
        </div>
        <Input
          prefix={<Search size={14} className="text-gray-400" />}
          placeholder="搜索单集..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!mb-3"
          allowClear
        />
        <Segmented
          size="small"
          value={filter}
          onChange={(v) => setFilter(v as any)}
          options={[
            { label: '全部', value: 'all' },
            { label: '进行中', value: 'editing' },
            { label: '待审核', value: 'reviewing' },
            { label: '待发布', value: 'ready' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((ep) => {
          const cfg = STATUS_CONFIG[ep.status]
          const selected = ep.id === selectedId
          const progress = getProgress(ep)
          const dl = getDeadlineLabel(ep.deadline)
          return (
            <div
              key={ep.id}
              onClick={() => onSelect(ep.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                selected
                  ? 'bg-primary-50 ring-1 ring-primary-300 shadow-sm'
                  : 'hover:bg-gray-50 ring-1 ring-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Tag
                  className="!mb-0 !rounded-full !text-xs !px-2"
                  style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: 'transparent' }}
                >
                  <span className="status-dot" style={{ background: cfg.dot }} />
                  {cfg.label}
                </Tag>
                <span className="text-[10px] font-medium" style={{ color: dl.color }}>{dl.text}</span>
              </div>
              <div className="font-medium text-sm text-gray-900 line-clamp-1 mb-1">{ep.title}</div>
              <div className="flex items-center justify-between">
                <Progress percent={progress.pct} showInfo={false} size="small" strokeColor={cfg.color} className="flex-1 !mr-3 !mb-0" />
                <span className="text-xs text-gray-400 font-medium">{progress.pct}%</span>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <Empty description="没有匹配的单集" className="mt-12" />}
      </div>
    </div>
  )
}

function EpisodeHeader({ episode }: { episode: Episode }) {
  const { message } = AntApp.useApp()
  const members = useStore((s) => s.members)
  const guests = useStore((s) => s.guests)
  const season = useStore((s) => s.getSeasonById(episode.seasonId))
  const updateStatus = useStore((s) => s.updateEpisodeStatus)
  const cfg = STATUS_CONFIG[episode.status]
  const progress = getProgress(episode)
  const currentStep = Math.max(0, STATUS_FLOW.indexOf(episode.status))
  const epGuests = episode.guestIds.map((id) => guests.find((g) => g.id === id)!).filter(Boolean)
  const epMembers = episode.assigneeIds.map((id) => members.find((m) => m.id === id)!).filter(Boolean)
  const dl = getDeadlineLabel(episode.deadline)

  return (
    <Card className="!rounded-2xl border-0 shadow-sm mb-4" styles={{ body: { padding: 24 } }}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Tag
              className="!rounded-full !text-sm !px-3 !py-0.5"
              style={{ backgroundColor: (season?.color || '#4361ee') + '20', color: season?.color, border: 'none' }}
            >
              {season?.name}
            </Tag>
            <Tag className="!rounded-full !text-sm !px-3 !py-0.5" style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none' }}>
              <span className="status-dot" style={{ background: cfg.dot }} />
              {cfg.label}
            </Tag>
          </div>
          <Title level={3} className="!mb-1 !text-xl">
            EP{String(episode.number).padStart(3, '0')} · {episode.title}
          </Title>
          {episode.subtitle && <Text type="secondary" className="text-sm">{episode.subtitle}</Text>}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarClock size={14} />
              截止: <b>{formatDate(episode.deadline, 'MM月DD日')}</b>
              <Tag
                className="!rounded-full !ml-2"
                color={dl.color === '#dc2626' ? 'red' : dl.color === '#f59e0b' ? 'gold' : 'default'}
              >
                {dl.text}
              </Tag>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              计划发布: <b>{formatDate(episode.scheduledDate, 'MM月DD日')}</b>
            </div>
          </div>
          {episode.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {episode.topics.map((t) => (
                <Tag key={t} className="!rounded-lg !text-xs">#{t}</Tag>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex -space-x-2">
            {epMembers.map((m) => (
              <Tooltip key={m.id} title={`${m.name} · ${m.role}`}>
                <Avatar size={34} style={{ backgroundColor: m.color, fontSize: 12, border: '2px solid white' }}>
                  {initials(m.name)}
                </Avatar>
              </Tooltip>
            ))}
            {epGuests.map((g) => (
              <Tooltip key={g.id} title={`嘉宾: ${g.name}`}>
                <Avatar size={34} style={{ backgroundColor: '#f5f5f5', color: '#666', fontSize: 12, border: '2px solid white' }}>
                  {initials(g.name)}
                </Avatar>
              </Tooltip>
            ))}
          </div>
          <Select
            value={episode.status}
            size="large"
            className="!w-40"
            onChange={(v: EpisodeStatus) => {
              updateStatus(episode.id, v)
              message.success(`状态已更新为「${STATUS_CONFIG[v].label}」`)
            }}
            options={STATUS_FLOW.map((s) => ({
              value: s,
              label: (
                <span>
                  <span className="status-dot" style={{ background: STATUS_CONFIG[s].dot }} />
                  {STATUS_CONFIG[s].label}
                </span>
              ),
            }))}
          />
        </div>
      </div>
      <Divider className="!my-5" />
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-3xl">
          <Steps
            size="small"
            current={currentStep}
            items={STATUS_FLOW.map((s) => ({ title: STATUS_CONFIG[s].label }))}
          />
        </div>
        <div className="w-60 flex items-center gap-4 pl-6 border-l border-gray-100">
          <Progress type="dashboard" percent={progress.pct} size={80} strokeColor={{ '0%': '#4361ee', '100%': '#10b981' }} />
          <div>
            <div className="text-xs text-gray-500 mb-0.5">完成进度</div>
            <div className="text-lg font-bold text-gray-900">{progress.done} / {progress.total}</div>
            <div className="text-xs text-gray-400">子项完成</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function TopicPanel({ episode }: { episode: Episode }) {
  const topics = useStore((s) => s.topics)
  const members = useStore((s) => s.members)
  const voteTopic = useStore((s) => s.voteTopic)
  const setTopicStatus = useStore((s) => s.setTopicStatus)
  const addTopic = useStore((s) => s.addTopic)
  const { message } = AntApp.useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form] = Form.useForm()
  const related = topics.filter((t) => t.episodeId === episode.id)
  const backlog = topics.filter((t) => t.status === 'backlog')

  const submit = (values: any) => {
    addTopic({ ...values, tags: values.tags || [], submittedBy: members[0].id })
    setShowAdd(false)
    form.resetFields()
    message.success('选题已加入选题池')
  }

  const TopicList = ({ list, emptyText }: { list: TopicIdea[]; emptyText: string }) => (
    <List
      locale={{ emptyText: <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      dataSource={list.sort((a, b) => b.votes - a.votes)}
      renderItem={(t) => {
        const submitter = members.find((m) => m.id === t.submittedBy)
        return (
          <List.Item className="!p-4 !border-b !border-gray-50 last:!border-0 hover:!bg-gray-50 transition">
            <div className="w-full flex items-start gap-4">
              <Button
                type={t.votes > 20 ? 'primary' : 'default'}
                shape="circle"
                size="large"
                onClick={() => voteTopic(t.id)}
                className={`!min-w-[48px] !flex-col !h-auto !py-2 !leading-none ${t.votes > 20 ? '!bg-amber-500 !border-amber-500' : ''}`}
              >
                <div className="text-lg font-bold leading-tight">{t.votes}</div>
                <div className="text-[10px] opacity-80">🔥 票</div>
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1">{t.title}</div>
                    <Paragraph className="!mb-2 text-sm text-gray-600 !line-clamp-2" ellipsis={{ rows: 2 }}>{t.description}</Paragraph>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Tag color="blue" className="!rounded-full !text-xs !mb-0">{t.source}</Tag>
                      {t.tags.map((tag) => <Tag key={tag} className="!rounded !text-xs !mb-0">#{tag}</Tag>)}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        由 <Avatar size={16} style={{ backgroundColor: submitter?.color || '#999', fontSize: 9 }}>{submitter?.name?.[0]}</Avatar>
                        <b className="text-gray-600">{submitter?.name || '未知'}</b> · {formatDate(t.createdAt, 'MM/DD')}
                      </span>
                    </div>
                  </div>
                  <Select
                    size="small"
                    value={t.status}
                    className="!w-28"
                    onChange={(v) => setTopicStatus(t.id, v)}
                    options={[
                      { value: 'backlog', label: '待评估' },
                      { value: 'planned', label: '已立项' },
                      { value: 'dropped', label: '已搁置' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </List.Item>
        )
      }}
    />
  )

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl border-0 shadow-sm"
        title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-amber-400 to-red-500" />本单集选题</div>}
        extra={<Button type="primary" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>提交新选题</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <TopicList list={related} emptyText="尚未立项，从下方选题池挑选或新建" />
      </Card>
      <Card className="!rounded-2xl border-0 shadow-sm"
        title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-primary-400 to-primary-600" />💡 公共选题池（待评估）</div>}
        styles={{ body: { padding: 0 } }}
      >
        <TopicList list={backlog} emptyText="选题池为空，头脑风暴吧！" />
      </Card>
      <Modal title="提交新选题" open={showAdd} onCancel={() => setShowAdd(false)} onOk={() => form.submit()} okText="提交到选题池" width={600}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="选题标题" name="title" rules={[{ required: true }]}>
            <Input size="large" placeholder="一句话描述这个选题，要能抓住人" />
          </Form.Item>
          <Form.Item label="详细描述" name="description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="说说为什么这个选题值得聊？切入点是什么？" />
          </Form.Item>
          <Form.Item label="标签" name="tags"><Select mode="tags" size="large" placeholder="输入后回车添加标签" /></Form.Item>
          <Form.Item label="选题来源" name="source" initialValue="团队头脑风暴">
            <Select size="large" options={['团队头脑风暴', '听众留言', '听众邮件', '社群讨论', '嘉宾推荐', '热点话题', '内部'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

function GuestPanel({ episode }: { episode: Episode }) {
  const guests = useStore((s) => s.guests)
  const addGuestToEpisode = useStore((s) => s.addGuestToEpisode)
  const removeGuestFromEpisode = useStore((s) => s.removeGuestFromEpisode)
  const epGuests = episode.guestIds.map((id) => guests.find((g) => g.id === id)!).filter(Boolean)
  const others = guests.filter((g) => !episode.guestIds.includes(g.id))
  const { message } = AntApp.useApp()
  const [showAll, setShowAll] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [searchKey, setSearchKey] = useState('')
  const displayOthers = (showAll ? others : others.slice(0, 4)).filter(
    (g) => !searchKey || g.name.includes(searchKey) || g.tags.some((t) => t.includes(searchKey)),
  )

  const handleInvite = (guestId: string) => {
    addGuestToEpisode(episode.id, guestId)
    setSelectedGuest(null)
    message.success('嘉宾已加入本集')
  }

  const handleRemove = (guestId: string) => {
    removeGuestFromEpisode(episode.id, guestId)
    message.info('已从本集移除嘉宾')
  }

  const GuestCard = ({ g, confirmed }: { g: Guest; confirmed: boolean }) => (
    <div
      onClick={() => setSelectedGuest(g)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition hover:shadow-md ${
        confirmed ? 'border-green-200 bg-green-50/50' : 'border-gray-100 bg-white hover:border-primary-200'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar size={48} style={{ backgroundColor: '#6366f1', fontSize: 16 }}>{initials(g.name)}</Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-semibold text-gray-900">{g.name}</span>
            {confirmed && <Tag color="green" className="!rounded-full !text-xs !mb-0 !px-2">✓ 已确认</Tag>}
            <Rate disabled defaultValue={4.5} count={5} allowHalf className="!text-xs !mb-0" />
          </div>
          <div className="text-sm text-gray-600 line-clamp-1">{g.title}</div>
          <div className="text-xs text-gray-400">{g.company}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {g.tags.slice(0, 4).map((t) => <Tag key={t} className="!rounded !text-xs !mb-0">#{t}</Tag>)}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <History size={12} /> 已参与 {g.history.length} 期
        </div>
        {confirmed ? (
          <Button size="small" danger type="text" onClick={(e) => { e.stopPropagation(); handleRemove(g.id) }}>
            移除
          </Button>
        ) : (
          <Button size="small" type="primary" ghost onClick={(e) => { e.stopPropagation(); handleInvite(g.id) }}>
            邀请
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl border-0 shadow-sm"
        title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-green-400 to-emerald-600" />✓ 本期嘉宾 ({epGuests.length})</div>}
        styles={{ body: { padding: 16 } }}
      >
        {epGuests.length === 0 ? (
          <Empty description="尚未邀请嘉宾，从下方嘉宾库选择吧" />
        ) : (
          <Row gutter={[16, 16]}>
            {epGuests.map((g) => <Col key={g.id} xs={24} md={12} xl={8}><GuestCard g={g} confirmed /></Col>)}
          </Row>
        )}
      </Card>
      <Card className="!rounded-2xl border-0 shadow-sm"
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-blue-400 to-indigo-600" />👥 嘉宾库 ({others.length})</div>
            <Space>
              <Input.Search
                placeholder="搜索嘉宾..."
                style={{ width: 240 }}
                size="small"
                allowClear
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </Space>
          </div>
        }
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[16, 16]}>
          {displayOthers.map((g) => <Col key={g.id} xs={24} md={12} xl={8}><GuestCard g={g} confirmed={false} /></Col>)}
        </Row>
        {others.length > 4 && !showAll && (
          <div className="text-center mt-4"><Button onClick={() => setShowAll(true)}>加载更多嘉宾 (+{others.length - 4})</Button></div>
        )}
      </Card>
      <Modal
        title={selectedGuest ? (
          <div className="flex items-center gap-3">
            <Avatar size={44} style={{ backgroundColor: '#6366f1', fontSize: 16 }}>{initials(selectedGuest.name)}</Avatar>
            <div>
              <div className="font-semibold text-lg">{selectedGuest.name}</div>
              <div className="text-sm text-gray-500">{selectedGuest.title} · {selectedGuest.company}</div>
            </div>
          </div>
        ) : ''}
        open={!!selectedGuest}
        onCancel={() => setSelectedGuest(null)}
        onOk={() => handleInvite(selectedGuest!.id)}
        okText={episode.guestIds.includes(selectedGuest?.id || '') ? '已邀请' : '邀请为本集嘉宾'}
        okButtonProps={{ disabled: episode.guestIds.includes(selectedGuest?.id || '') }}
        width={680}
      >
        {selectedGuest && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="标签" span={2}>
                <Space wrap>{selectedGuest.tags.map((t) => <Tag key={t}>{t}</Tag>)}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="简介" span={2}><Paragraph className="!mb-0">{selectedGuest.bio}</Paragraph></Descriptions.Item>
              <Descriptions.Item label="联系方式" span={2}>
                {selectedGuest.contacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    <Tag color="blue" className="!mb-0">{c.type}</Tag>
                    <Text copyable>{c.value}</Text>
                  </div>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="历史参与">{selectedGuest.history.length} 期</Descriptions.Item>
              <Descriptions.Item label="加入档案">{formatDate(selectedGuest.createdAt)}</Descriptions.Item>
            </Descriptions>
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2"><FileText size={14} /> 团队内部备注</div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-gray-700">{selectedGuest.notes}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function OutlinePanel({ episode }: { episode: Episode }) {
  const toggleOutline = useStore((s) => s.toggleOutline)
  const addOutlineItem = useStore((s) => s.addOutlineItem)
  const updateOutlineItem = useStore((s) => s.updateOutlineItem)
  const deleteOutlineItem = useStore((s) => s.deleteOutlineItem)
  const { message, modal } = AntApp.useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null)
  const [form] = Form.useForm()
  const total = episode.outline.length
  const done = episode.outline.filter((o) => o.done).length

  const handleAdd = (values: any) => {
    if (editingItem) {
      updateOutlineItem(episode.id, editingItem.id, {
        time: values.time || '',
        title: values.title,
        description: values.description || '',
        notes: values.notes || '',
      })
      message.success('提纲已更新')
    } else {
      addOutlineItem(episode.id, {
        time: values.time || '',
        title: values.title,
        description: values.description || '',
        notes: values.notes || '',
      })
      message.success('采访问题已添加')
    }
    setShowAdd(false)
    setEditingItem(null)
    form.resetFields()
  }

  const handleEdit = (item: OutlineItem) => {
    setEditingItem(item)
    form.setFieldsValue({
      time: item.time,
      title: item.title,
      description: item.description,
      notes: item.notes,
    })
    setShowAdd(true)
  }

  const handleDelete = (item: OutlineItem) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除提纲「${item.title}」吗？`,
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteOutlineItem(episode.id, item.id)
        message.success('已删除')
      },
    })
  }

  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-violet-400 to-purple-600" />📋 采访提纲
        <Tag color="blue" className="!ml-2 !rounded-full">{done} / {total} 已准备</Tag></div>}
      extra={<Button type="primary" size="small" icon={<Plus size={14} />} onClick={() => { setEditingItem(null); form.resetFields(); setShowAdd(true) }}>添加问题</Button>}
    >
      {episode.outline.length === 0 ? (
        <Empty description="还没有提纲，先梳理一下问题吧" />
      ) : (
        <Timeline
          items={episode.outline.map((o, idx) => ({
            dot: <Checkbox checked={o.done} onChange={() => toggleOutline(episode.id, o.id)} className="!scale-110" />,
            color: o.done ? 'green' : 'blue',
            children: (
              <div className="pb-6 -mt-1">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {o.time && <Tag color="gold" className="!rounded-full !text-sm !mb-0 !font-mono !font-semibold">⏱ {o.time}</Tag>}
                    <span className={`font-semibold ${o.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>Q{idx + 1}. {o.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="text" size="small" icon={<Edit3 size={14} />} onClick={() => handleEdit(o)} className="!text-gray-400 hover:!text-blue-600 !p-1" />
                    <Button type="text" size="small" icon={<Trash2 size={14} />} onClick={() => handleDelete(o)} className="!text-gray-400 hover:!text-red-500 !p-1" />
                  </div>
                </div>
                <Paragraph className={`!mb-1 text-sm ${o.done ? 'text-gray-400' : 'text-gray-600'}`}>{o.description}</Paragraph>
                {o.notes && <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 inline-block">💡 {o.notes}</div>}
                <div className="text-xs text-gray-400 mt-2">最近修改：{o.updatedAt}</div>
              </div>
            ),
          }))}
        />
      )}
      <Modal
        title={editingItem ? '编辑采访问题' : '添加采访问题'}
        open={showAdd}
        onCancel={() => { setShowAdd(false); setEditingItem(null) }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item label="时间点" name="time"><Input prefix={<Clock size={14} />} placeholder="例如 08:30，可选" /></Form.Item>
          <Form.Item label="问题标题" name="title" rules={[{ required: true }]}><Input placeholder="问题的一句话概括" /></Form.Item>
          <Form.Item label="详细描述" name="description" rules={[{ required: true }]}><TextArea rows={3} placeholder="引导方向、具体追问点..." /></Form.Item>
          <Form.Item label="主持人笔记" name="notes"><TextArea rows={2} placeholder="只有主持人自己看的提示" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

function RecordingPanel({ episode }: { episode: Episode }) {
  const columns: ColumnsType<RecordingItem> = [
    {
      title: '文件名',
      dataIndex: 'name',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Mic size={18} /></div>
          <div>
            <div className="font-medium text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{r.track} · {r.format}</div>
          </div>
        </div>
      ),
    },
    { title: '时长', dataIndex: 'duration', width: 100, render: (v) => <code className="text-sm">{v}</code> },
    { title: '大小', dataIndex: 'size', width: 100 },
    { title: '导入', dataIndex: 'importedAt', width: 120, render: (v) => formatDate(v) },
    {
      title: '备注',
      dataIndex: 'notes',
      render: (v) => (v ? <span className="text-sm text-amber-600">⚠️ {v}</span> : <span className="text-gray-400 text-sm">—</span>),
    },
    {
      title: '操作',
      width: 140,
      render: () => (
        <Space size="small">
          <Button size="small" type="link">预览</Button>
          <Button size="small" type="link" danger icon={<Trash2 size={12} />} />
        </Space>
      ),
    },
  ]
  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-cyan-400 to-blue-600" />🎙 录音清单
        <Tag color="cyan" className="!ml-2 !rounded-full">{episode.recordings.length} 个音轨</Tag></div>}
      extra={<Upload multiple><Button type="primary" icon={<UploadIcon size={14} />}>导入录音</Button></Upload>}
    >
      <Table columns={columns} dataSource={episode.recordings} rowKey="id" size="middle" pagination={false}
        locale={{ emptyText: <Empty description="还没有导入录音文件" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }} />
    </Card>
  )
}

function MaterialPanel({ episode }: { episode: Episode }) {
  const allMaterials = useStore((s) => s.materials)
  const related = allMaterials.filter((m) => m.episodeId === episode.id)
  const global = allMaterials.filter((m) => !m.episodeId)
  const members = useStore((s) => s.members)
  const typeMap: Record<string, { icon: any; color: string; bg: string }> = {
    audio: { icon: Mic, color: '#4361ee', bg: '#eef2ff' },
    image: { icon: Image, color: '#10b981', bg: '#ecfdf5' },
    video: { icon: Bookmark, color: '#f59e0b', bg: '#fef3c7' },
    document: { icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
    other: { icon: FolderOpen, color: '#6b7280', bg: '#f3f4f6' },
  }
  const MatCard = ({ m }: { m: MaterialAsset }) => {
    const tm = typeMap[m.type] || typeMap.other
    const uploader = members.find((x) => x.id === m.uploadedBy)
    return (
      <div className="p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-primary-200 transition cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tm.bg }}>
            <tm.icon size={22} style={{ color: tm.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm line-clamp-1">{m.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{m.size}{m.duration && ` · ${m.duration}`}{m.resolution && ` · ${m.resolution}`}</div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {m.tags.slice(0, 3).map((t) => <Tag key={t} className="!rounded !text-[10px] !mb-0 !py-0 !h-4 !leading-4">{t}</Tag>)}
            </div>
          </div>
          <Button type="text" size="small" icon={<MoreHorizontal size={14} />} className="!opacity-0 group-hover:!opacity-100 transition" />
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Avatar size={14} style={{ backgroundColor: uploader?.color, fontSize: 8 }}>{uploader?.name?.[0]}</Avatar>
            {uploader?.name}
          </span>
          <span>{formatDate(m.uploadedAt, 'MM/DD')}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl border-0 shadow-sm"
        title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-emerald-400 to-green-600" />📁 本单集素材 ({related.length})</div>}
        extra={<Upload directory><Button type="primary" icon={<UploadIcon size={14} />}>批量导入</Button></Upload>}
        styles={{ body: { padding: 16 } }}
      >
        {related.length === 0 ? <Empty description="该单集暂无专属素材" /> : (
          <Row gutter={[16, 16]}>{related.map((m) => <Col key={m.id} xs={24} sm={12} md={8} xl={6}><MatCard m={m} /></Col>)}</Row>
        )}
      </Card>
      <Card className="!rounded-2xl border-0 shadow-sm"
        title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-gray-400 to-gray-600" />📂 公共素材库</div>}
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[16, 16]}>{global.map((m) => <Col key={m.id} xs={24} sm={12} md={8} xl={6}><MatCard m={m} /></Col>)}</Row>
      </Card>
    </div>
  )
}

function ClipPanel({ episode }: { episode: Episode }) {
  const grouped = useMemo(() => {
    const g: Record<string, ClipMarker[]> = {}
    for (const c of episode.clips) { if (!g[c.type]) g[c.type] = []; g[c.type].push(c) }
    return g
  }, [episode.clips])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Segmented options={Object.keys(CLIP_TYPE_LABEL).map((k) => ({ label: CLIP_TYPE_LABEL[k].label, value: k }))} />
        <Button type="primary" icon={<Plus size={14} />}>标记片段</Button>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <Card className="!rounded-2xl border-0 shadow-sm"><Empty description="还没有标记任何片段" /></Card>
      ) : (
        Object.entries(grouped).map(([type, list]) => {
          const tcfg = CLIP_TYPE_LABEL[type] || { label: type, color: '#999' }
          return (
            <Card key={type} className="!rounded-2xl border-0 shadow-sm"
              title={<div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: tcfg.color }} />{tcfg.label} 片段 <Tag color="blue" className="!rounded-full !ml-2">{list.length}</Tag></div>}
              size="small"
            >
              <List
                dataSource={list.sort((a, b) => a.start.localeCompare(b.start))}
                renderItem={(c) => (
                  <List.Item className="!px-2 !py-3 hover:!bg-gray-50 rounded-lg transition">
                    <div className="w-full flex items-center gap-4">
                      <div className="px-3 py-1.5 rounded-lg font-mono font-bold text-sm flex-shrink-0" style={{ background: tcfg.color + '15', color: tcfg.color }}>
                        {c.start}<span className="mx-1 opacity-50">→</span>{c.end}
                      </div>
                      <div className="flex-1 text-sm text-gray-700">{c.description}</div>
                      <Space>
                        <Button size="small" type="text">导出</Button>
                        <Button size="small" type="text" danger icon={<Trash2 size={12} />} />
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )
        })
      )}
    </div>
  )
}

function MistakePanel({ episode }: { episode: Episode }) {
  const toggleMistake = useStore((s) => s.toggleMistake)
  const total = episode.mistakes.length
  const fixed = episode.mistakes.filter((m) => m.fixed).length
  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-red-400 to-rose-600" />⚠️ 口误 / 问题记录
        <Tag color={fixed === total ? 'green' : fixed > 0 ? 'gold' : 'red'} className="!rounded-full !ml-2">{fixed} / {total} 已修复</Tag></div>}
      extra={<Button type="primary" icon={<Plus size={14} />} size="small">记录问题</Button>}
    >
      {episode.mistakes.length === 0 ? (
        <Empty description="太棒了，没有需要修复的问题" />
      ) : (
        <List
          dataSource={episode.mistakes.sort((a, b) => a.time.localeCompare(b.time))}
          renderItem={(m) => (
            <List.Item className={`!p-4 !border-b !border-gray-50 last:!border-0 rounded-lg transition ${m.fixed ? 'opacity-60' : ''}`}>
              <div className="w-full flex items-center gap-4">
                <Checkbox checked={m.fixed} onChange={() => toggleMistake(episode.id, m.id)} />
                <div className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-mono font-bold text-sm flex-shrink-0">⏱ {m.time}</div>
                <div className={`flex-1 text-sm ${m.fixed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{m.description}</div>
                <Tag color={m.fixed ? 'green' : 'red'} className="!rounded-full">{m.fixed ? '已修复' : '待处理'}</Tag>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

function EditPanel({ episode }: { episode: Episode }) {
  const toggleEditTodo = useStore((s) => s.toggleEditTodo)
  const addEditTodo = useStore((s) => s.addEditTodo)
  const updateEditTodo = useStore((s) => s.updateEditTodo)
  const deleteEditTodo = useStore((s) => s.deleteEditTodo)
  const members = useStore((s) => s.members)
  const { message, modal } = AntApp.useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editingTodo, setEditingTodo] = useState<EditTodo | null>(null)
  const [form] = Form.useForm()
  const total = episode.editTodos.length
  const done = episode.editTodos.filter((t) => t.done).length

  const handleAdd = (values: any) => {
    if (editingTodo) {
      updateEditTodo(episode.id, editingTodo.id, {
        content: values.content,
        assigneeId: values.assigneeId,
        deadline: values.deadline,
        priority: values.priority,
      })
      message.success('任务已更新')
    } else {
      addEditTodo(episode.id, {
        content: values.content,
        assigneeId: values.assigneeId,
        deadline: values.deadline,
        priority: values.priority,
        done: false,
      })
      message.success('剪辑任务已添加')
    }
    setShowAdd(false)
    setEditingTodo(null)
    form.resetFields()
  }

  const handleEdit = (todo: EditTodo) => {
    setEditingTodo(todo)
    form.setFieldsValue({
      content: todo.content,
      assigneeId: todo.assigneeId,
      deadline: todo.deadline,
      priority: todo.priority,
    })
    setShowAdd(true)
  }

  const handleDelete = (todo: EditTodo) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除剪辑任务「${todo.content.slice(0, 20)}...」吗？`,
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteEditTodo(episode.id, todo.id)
        message.success('已删除')
      },
    })
  }

  const columns: ColumnsType<EditTodo> = [
    { title: ' ', dataIndex: 'done', width: 48, render: (_, r) => <Checkbox checked={r.done} onChange={() => toggleEditTodo(episode.id, r.id)} /> },
    {
      title: '任务内容',
      dataIndex: 'content',
      render: (v, r) => (
        <div>
          <div className={`font-medium ${r.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{v}</div>
          <div className="text-xs text-gray-400 mt-0.5">最近修改：{r.updatedAt}</div>
        </div>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (p: Priority) => (
        <Tag color={p === 'low' ? 'default' : p === 'medium' ? 'gold' : 'red'} className="!rounded-full">{PRIORITY_CONFIG[p].label}</Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assigneeId',
      width: 140,
      render: (id) => {
        const m = members.find((x) => x.id === id)
        if (!m) return '—'
        return (
          <div className="flex items-center gap-2">
            <Avatar size={24} style={{ backgroundColor: m.color, fontSize: 10 }}>{initials(m.name)}</Avatar>
            <span className="text-sm">{m.name}</span>
          </div>
        )
      },
    },
    {
      title: '截止',
      dataIndex: 'deadline',
      width: 140,
      render: (d) => {
        const dl = getDeadlineLabel(d)
        return (
          <div className="text-sm">
            <div>{formatDate(d, 'MM/DD')}</div>
            <div className="text-xs" style={{ color: dl.color }}>{dl.text}</div>
          </div>
        )
      },
    },
    {
      title: '操作',
      width: 100,
      render: (_, r) => (
        <Space size="small">
          <Button size="small" type="text" onClick={() => handleEdit(r)}>编辑</Button>
          <Button size="small" type="text" danger icon={<Trash2 size={12} />} onClick={() => handleDelete(r)} />
        </Space>
      ),
    },
  ]

  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-orange-400 to-amber-600" />✅ 剪辑待办
        <Tag color="blue" className="!rounded-full !ml-2">{done} / {total}</Tag>
        <Progress percent={total ? Math.round((done / total) * 100) : 0} showInfo={false} size="small" className="!w-32 !mb-0" /></div>}
      extra={<Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditingTodo(null); form.resetFields(); setShowAdd(true) }}>添加任务</Button>}
    >
      <Table columns={columns} dataSource={episode.editTodos} rowKey="id" size="middle" pagination={false}
        rowClassName={(r) => (r.done ? 'opacity-60' : '')} locale={{ emptyText: <Empty description="暂无剪辑任务" /> }} />
      <Modal
        title={editingTodo ? '编辑剪辑任务' : '添加剪辑任务'}
        open={showAdd}
        onCancel={() => { setShowAdd(false); setEditingTodo(null) }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item label="任务内容" name="content" rules={[{ required: true }]}>
            <TextArea rows={2} placeholder="需要做的具体事情" />
          </Form.Item>
          <Form.Item label="负责人" name="assigneeId" rules={[{ required: true }]}>
            <Select size="large" options={members.map((m) => ({
              value: m.id,
              label: (
                <div className="flex items-center gap-2">
                  <Avatar size={22} style={{ backgroundColor: m.color, fontSize: 10 }}>{initials(m.name)}</Avatar>
                  {m.name} <span className="text-gray-400">· {m.role}</span>
                </div>
              ),
            }))} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="优先级" name="priority" initialValue="medium" rules={[{ required: true }]}>
              <Select size="large" options={(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => ({
                value: p,
                label: <span style={{ color: PRIORITY_CONFIG[p].color }}>● {PRIORITY_CONFIG[p].label}</span>,
              }))} />
            </Form.Item>
            <Form.Item label="截止日期" name="deadline" rules={[{ required: true }]}>
              <Input size="large" type="date" defaultValue={dayjs().add(3, 'day').format('YYYY-MM-DD')} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Card>
  )
}

function MusicPanel({ episode }: { episode: Episode }) {
  const columns: ColumnsType<MusicItem> = [
    {
      title: '曲目信息',
      dataIndex: 'name',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white"><Music size={22} /></div>
          <div>
            <div className="font-medium text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{r.artist} · {r.album}</div>
          </div>
        </div>
      ),
    },
    { title: '用途', dataIndex: 'usage', width: 140, render: (v) => <Tag color="purple" className="!rounded-full">{v}</Tag> },
    { title: '时长', dataIndex: 'duration', width: 80, render: (v) => <code>{v}</code> },
    { title: '授权', dataIndex: 'license', width: 200 },
    { title: '费用', dataIndex: 'cost', width: 100 },
    { title: '操作', width: 100, render: () => <Button size="small" type="text">查看证书</Button> },
  ]
  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-purple-400 to-fuchsia-600" />🎵 版权音乐登记
        <Tag color="purple" className="!rounded-full !ml-2">{episode.musics.length} 首</Tag></div>}
      extra={<Button type="primary" icon={<Plus size={14} />}>登记版权</Button>}
    >
      <Table columns={columns} dataSource={episode.musics} rowKey="id" pagination={false}
        locale={{ emptyText: <Empty description="尚未登记版权音乐" /> }} />
    </Card>
  )
}

function CoverPanel({ episode }: { episode: Episode }) {
  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-pink-400 to-rose-600" />🖼 封面草稿</div>}
      extra={<Upload><Button type="primary" icon={<UploadIcon size={14} />}>上传新封面</Button></Upload>}
    >
      {episode.coverDrafts.length === 0 ? (
        <Empty description="还没有封面设计" />
      ) : (
        <Row gutter={[16, 16]}>
          {episode.coverDrafts.map((c, idx) => (
            <Col key={c.id} xs={24} sm={12} md={8} xl={6}>
              <div
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer transition-all px-4 text-center ${
                  c.selected ? 'ring-4 ring-green-400 shadow-xl scale-[1.02]' : 'hover:shadow-lg'
                }`}
                style={{
                  background:
                    idx % 3 === 0
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : idx % 3 === 1
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                }}
              >
                <div className="text-lg font-bold mb-2">EP{String(episode.number).padStart(3, '0')}</div>
                <div className="text-xs opacity-90 line-clamp-3">{episode.title.replace(/^EP\d+\s*/, '').slice(0, 50)}</div>
                {c.selected && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg"><Check size={16} /></div>
                )}
              </div>
              <div className="mt-2 px-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{c.version}</span>
                  <Tag color={c.selected ? 'green' : 'default'} className="!rounded-full !mb-0">{c.selected ? '已选中' : '备选'}</Tag>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  )
}

function CopyPanel({ episode }: { episode: Episode }) {
  const [active, setActive] = useState<'shownotes' | 'chapters' | 'social'>('shownotes')
  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-sky-400 to-blue-600" />✍️ 文案编辑</div>}
      extra={
        <Segmented
          value={active}
          onChange={(v) => setActive(v as any)}
          options={[
            { label: 'Shownotes', value: 'shownotes' },
            { label: '章节', value: 'chapters' },
            { label: '社交文案', value: 'social' },
          ]}
        />
      }
    >
      <div className="space-y-4">
        {active === 'shownotes' && (
          <>
            <div>
              <div className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>📝 Shownotes（长文案）</span>
                <span className="text-xs text-gray-400">{episode.copywriting.showNotes.length} 字</span>
              </div>
              <TextArea rows={10} defaultValue={episode.copywriting.showNotes} className="!rounded-xl" />
            </div>
            <div>
              <div className="text-sm font-medium mb-2">🎯 备选标题</div>
              <div className="space-y-2">
                {episode.copywriting.titleOptions.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <Radio checked={i === 0} />
                    <span className="flex-1 text-sm text-gray-800">{t}</span>
                    <Star size={14} className={i === 0 ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
                  </div>
                ))}
                <Button type="dashed" block size="large" icon={<Plus size={14} />}>添加备选标题</Button>
              </div>
            </div>
          </>
        )}
        {active === 'chapters' && (
          <div>
            <div className="text-sm font-medium mb-2 flex items-center justify-between">
              <span>📑 章节标记</span>
              <span className="text-xs text-gray-400">小宇宙 / Apple 播客支持</span>
            </div>
            <TextArea rows={12} defaultValue={episode.copywriting.chapters} className="!rounded-xl font-mono text-sm" />
          </div>
        )}
        {active === 'social' && (
          <div>
            <div className="text-sm font-medium mb-2">📱 社交媒体文案</div>
            <TextArea rows={8} defaultValue={episode.copywriting.social} className="!rounded-xl" />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Tag>小红书</Tag><Tag>微信公众号</Tag><Tag>Twitter/X</Tag><Tag>即刻</Tag><Tag>豆瓣</Tag>
            </div>
          </div>
        )}
        <Divider />
        <div className="flex items-center justify-end gap-3">
          <Button size="large">保存草稿</Button>
          <Button type="primary" size="large"><Send size={14} className="mr-1" />提交审核</Button>
        </div>
      </div>
    </Card>
  )
}

function TimelinePanel({ episode }: { episode: Episode }) {
  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-teal-400 to-cyan-600" />⏰ 时间轴备注（剪辑指导）</div>}
      extra={<Button type="primary" icon={<Plus size={14} />}>添加备注</Button>}
    >
      {episode.timelineNotes.length === 0 ? (
        <Empty description="还没有时间轴备注，在这里给剪辑师写说明" />
      ) : (
        <div className="space-y-3">
          {episode.timelineNotes.map((n, i) => (
            <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="w-28 h-24 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex flex-col items-center justify-center text-white flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(67,97,238,0.3),transparent_60%)]" />
                  <div className="text-xl font-bold font-mono relative">{n.time.split('-')[0]}</div>
                  {n.time.includes('-') && <div className="text-[10px] opacity-60 relative">→ {n.time.split('-')[1]}</div>}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-700 leading-relaxed">{n.note}</div>
                </div>
                <Space size="small" className="flex-shrink-0">
                  <Button size="small" type="text">编辑</Button>
                  <Button size="small" type="text" danger icon={<Trash2 size={12} />} />
                </Space>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  status_change: { icon: Check, color: '#10b981', bg: '#d1fae5', label: '状态变更' },
  review_added: { icon: MessageSquare, color: '#8b5cf6', bg: '#f5f3ff', label: '审核意见' },
  review_resolved: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', label: '审核解决' },
  guest_added: { icon: UserPlus, color: '#3b82f6', bg: '#dbeafe', label: '嘉宾加入' },
  guest_removed: { icon: UserMinus, color: '#ef4444', bg: '#fee2e2', label: '嘉宾移除' },
  outline_added: { icon: FileText, color: '#8b5cf6', bg: '#f5f3ff', label: '提纲新增' },
  outline_updated: { icon: Edit3, color: '#8b5cf6', bg: '#f5f3ff', label: '提纲更新' },
  outline_deleted: { icon: Trash2, color: '#ef4444', bg: '#fee2e2', label: '提纲删除' },
  outline_toggled: { icon: CheckSquare, color: '#10b981', bg: '#d1fae5', label: '提纲状态' },
  edit_todo_added: { icon: CheckSquare, color: '#f59e0b', bg: '#fef3c7', label: '待办新增' },
  edit_todo_updated: { icon: Edit3, color: '#f59e0b', bg: '#fef3c7', label: '待办更新' },
  edit_todo_deleted: { icon: Trash2, color: '#ef4444', bg: '#fee2e2', label: '待办删除' },
  edit_todo_toggled: { icon: Check, color: '#10b981', bg: '#d1fae5', label: '待办完成' },
  mistake_toggled: { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2', label: '口误状态' },
  publish_check_updated: { icon: ClipboardCheck, color: '#6366f1', bg: '#e0e7ff', label: '发布检查' },
  listener_data_added: { icon: BarChart3, color: '#0ea5e9', bg: '#e0f2fe', label: '数据新增' },
  listener_data_updated: { icon: Edit3, color: '#0ea5e9', bg: '#e0f2fe', label: '数据更新' },
  listener_data_deleted: { icon: Trash2, color: '#ef4444', bg: '#fee2e2', label: '数据删除' },
}

function ActivityLogPanel({ episode }: { episode: Episode }) {
  const getMember = useStore((s) => s.getMemberById)
  const sortedLogs = useMemo(() =>
    [...episode.activityLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [episode.activityLog],
  )

  const groupByDate = useMemo(() => {
    const groups: Record<string, typeof sortedLogs> = {}
    for (const log of sortedLogs) {
      const date = log.timestamp.split(' ')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(log)
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [sortedLogs])

  return (
    <Card className="!rounded-2xl border-0 shadow-sm"
      title={<div className="flex items-center gap-2"><div className="w-1 h-5 rounded bg-gradient-to-b from-indigo-400 to-violet-600" />📋 制作记录
        <Tag color="blue" className="!ml-2 !rounded-full">{episode.activityLog.length} 条记录</Tag></div>}
    >
      {sortedLogs.length === 0 ? (
        <Empty description="还没有操作记录" />
      ) : (
        <div className="space-y-8">
          {groupByDate.map(([date, logs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-sm font-semibold text-gray-500">{formatDate(date)}</div>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <Timeline
                mode="left"
                items={logs.map((log) => {
                  const cfg = ACTION_CONFIG[log.action] || {
                    icon: Activity,
                    color: '#6b7280',
                    bg: '#f3f4f6',
                    label: log.action,
                  }
                  const member = getMember(log.memberId)
                  return {
                    dot: (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                        style={{ background: cfg.bg }}
                      >
                        <cfg.icon size={16} style={{ color: cfg.color }} />
                      </div>
                    ),
                    label: (
                      <div className="text-xs text-gray-400 pt-2.5">
                        {log.timestamp.split(' ')[1]}
                      </div>
                    ),
                    children: (
                      <div className="pb-5 pl-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag
                            className="!rounded-full !text-xs !mb-0"
                            style={{ background: cfg.bg, color: cfg.color, border: 'none' }}
                          >
                            {cfg.label}
                          </Tag>
                          {member && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Avatar size={16} style={{ backgroundColor: member.color, fontSize: 8 }}>
                                {member.name[0]}
                              </Avatar>
                              {member.name}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">{log.detail}</div>
                      </div>
                    ),
                  }
                })}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function EpisodeWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const episodes = useStore((s) => s.episodes)
  const setSelectedId = useStore((s) => s.setSelectedEpisode)
  const selectedId = useStore((s) => s.selectedEpisodeId)
  const getEpisodeById = useStore((s) => s.getEpisodeById)

  useEffect(() => {
    if (id && episodes.find((e) => e.id === id)) {
      setSelectedId(id)
    } else if (!selectedId && episodes.length > 0) {
      const active = episodes.find((e) => e.status === 'editing' || e.status === 'reviewing') || episodes[0]
      setSelectedId(active.id)
      navigate(`/episodes/${active.id}`, { replace: true })
    }
  }, [id, episodes])

  const currentEpisode = selectedId ? getEpisodeById(selectedId) : null

  const onSelect = (epId: string) => {
    setSelectedId(epId)
    navigate(`/episodes/${epId}`)
  }

  const renderTabContent = (key: string) => {
    if (!currentEpisode) return null
    switch (key) {
      case 'topic': return <TopicPanel episode={currentEpisode} />
      case 'guest': return <GuestPanel episode={currentEpisode} />
      case 'outline': return <OutlinePanel episode={currentEpisode} />
      case 'recording': return <RecordingPanel episode={currentEpisode} />
      case 'material': return <MaterialPanel episode={currentEpisode} />
      case 'clip': return <ClipPanel episode={currentEpisode} />
      case 'mistake': return <MistakePanel episode={currentEpisode} />
      case 'edit': return <EditPanel episode={currentEpisode} />
      case 'music': return <MusicPanel episode={currentEpisode} />
      case 'cover': return <CoverPanel episode={currentEpisode} />
      case 'copy': return <CopyPanel episode={currentEpisode} />
      case 'timeline': return <TimelinePanel episode={currentEpisode} />
      case 'activity': return <ActivityLogPanel episode={currentEpisode} />
      default: return null
    }
  }

  return (
    <Layout className="!bg-transparent h-full">
      <Sider width={320} theme="light" className="!rounded-2xl overflow-hidden shadow-sm !bg-white">
        <EpisodeSidebar episodes={episodes} selectedId={selectedId} onSelect={onSelect} />
      </Sider>
      <Content className="!pl-4 !bg-transparent overflow-hidden flex flex-col">
        {currentEpisode ? (
          <>
            <EpisodeHeader episode={currentEpisode} />
            <Card className="!rounded-2xl border-0 shadow-sm flex-1 overflow-hidden flex flex-col" styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}>
              <Tabs
                tabPosition="left"
                className="workspace-tabs flex-1"
                style={{ display: 'flex', flex: 1, minHeight: 0 }}
                items={WORK_TABS.map((t) => ({
                  key: t.key,
                  label: (
                    <div className="flex items-center gap-3 py-1.5 pr-4">
                      <t.icon size={18} />
                      <div className="text-left">
                        <div className="font-medium leading-tight">{t.label}</div>
                        <div className="text-[10px] text-gray-400">{t.desc}</div>
                      </div>
                    </div>
                  ),
                  children: (
                    <div className="px-6 py-5 overflow-auto" style={{ maxHeight: 'calc(100vh - 480px)' }}>
                      {renderTabContent(t.key)}
                    </div>
                  ),
                }))}
              />
            </Card>
          </>
        ) : (
          <div className="h-full flex items-center justify-center"><Empty description="请从左侧选择一个单集" /></div>
        )}
      </Content>
    </Layout>
  )
}
