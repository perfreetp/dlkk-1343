import { useMemo, useState } from 'react'
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
  Segmented,
  Badge,
  Tooltip,
  Progress,
  Modal,
  Form,
  Select,
  App as AntApp,
  Calendar as AntCalendar,
  List,
  Divider,
} from 'antd'
import type { BadgeProps, CalendarProps } from 'antd'
import {
  Search,
  Plus,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Rocket,
  DollarSign,
  Mic,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Music,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { STATUS_CONFIG, formatDate, initials, getDeadlineLabel, getProgress } from '@/utils'
import type { Episode } from '@/types'
import dayjs, { Dayjs } from 'dayjs'

const { Title, Text } = Typography

export default function PublishCalendar() {
  const episodes = useStore((s) => s.episodes)
  const members = useStore((s) => s.members)
  const seasons = useStore((s) => s.seasons)
  const updateEpisodeStatus = useStore((s) => s.updateEpisodeStatus)
  const { message } = useApp()
  const navigate = useNavigate()
  const [view, setView] = useState<'calendar' | 'kanban' | 'timeline'>('calendar')
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState<Dayjs>(dayjs())
  const [selectedEp, setSelectedEp] = useState<Episode | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [form] = Form.useForm()

  const allScheduled = useMemo(() => {
    let list = [...episodes].filter((e) => e.status !== 'archived')
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.topics.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return list.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
  }, [episodes, search])

  const stats = useMemo(() => {
    const thisMonth = allScheduled.filter(
      (e) => dayjs(e.scheduledDate).format('YYYY-MM') === month.format('YYYY-MM'),
    )
    const pending = allScheduled.filter((e) => e.status === 'ready').length
    const scheduled = allScheduled.filter((e) => !['published', 'archived'].includes(e.status)).length
    const totalSponsorSlots = allScheduled.reduce((acc, e) => acc + e.sponsorSlots.length, 0)
    const doneSponsors = allScheduled.reduce(
      (acc, e) => acc + e.sponsorSlots.filter((s) => s.done).length,
      0,
    )
    return {
      thisMonth: thisMonth.length,
      pending,
      scheduled,
      totalSponsorSlots,
      doneSponsors,
    }
  }, [allScheduled, month])

  const monthList = useMemo(() => {
    return allScheduled.filter(
      (e) => dayjs(e.scheduledDate).format('YYYY-MM') === month.format('YYYY-MM'),
    )
  }, [allScheduled, month])

  const getListData = (value: dayjs.Dayjs) => {
    const list = monthList.filter(
      (e) => dayjs(e.scheduledDate).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'),
    )
    return list.map((e) => {
      const cfg = STATUS_CONFIG[e.status]
      const dl = getDeadlineLabel(e.deadline)
      return {
        type: cfg.color as any,
        content: e,
      }
    })
  }

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type !== 'date') return info.originNode
    const list = getListData(current) as any[]
    return (
      <div className="w-full h-full min-h-[100px] py-1">
        {list.length > 0 && (
          <div className="space-y-1 mt-1">
            {list.slice(0, 3).map((item, idx) => {
              const ep = item.content as Episode
              const cfg = STATUS_CONFIG[ep.status]
              const season = seasons.find((s) => s.id === ep.seasonId)
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedEp(ep)
                  }}
                  className={`mx-1 px-1.5 py-1 rounded-md text-[11px] cursor-pointer transition hover:shadow-sm line-clamp-1 border-l-2 ${
                    ep.status === 'published' ? 'opacity-70' : ''
                  }`}
                  style={{
                    backgroundColor: cfg.bg,
                    color: cfg.color,
                    borderLeftColor: cfg.dot,
                  }}
                >
                  <span className="font-semibold mr-1">
                    EP{String(ep.number).padStart(3, '0')}
                  </span>
                  {ep.title.replace(/^EP\d+\s*/, '').slice(0, 15)}
                </div>
              )
            })}
            {list.length > 3 && (
              <div className="text-[10px] text-gray-400 mx-1.5 mt-0.5">+{list.length - 3} 更多</div>
            )}
          </div>
        )}
      </div>
    )
  }

  const StatCard = ({
    label,
    value,
    sub,
    icon: Icon,
    color,
    bg,
  }: {
    label: string
    value: any
    sub?: string
    icon: any
    color: string
    bg: string
  }) => (
    <Card className="card-hover !rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-2xl font-bold mt-0.5" style={{ color }}>
            {value}
          </div>
          {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </Card>
  )

  const kanbanColumns: { key: string; label: string; color: string; bg: string; statuses: string[] }[] = [
    { key: 'idea', label: '选题筹备', color: '#6b7280', bg: '#f9fafb', statuses: ['idea', 'planning'] },
    { key: 'recording', label: '录制/剪辑', color: '#8b5cf6', bg: '#f5f3ff', statuses: ['recording', 'editing'] },
    { key: 'review', label: '审核', color: '#ef4444', bg: '#fef2f2', statuses: ['reviewing'] },
    { key: 'ready', label: '待发布', color: '#10b981', bg: '#ecfdf5', statuses: ['ready'] },
    { key: 'done', label: '已发布', color: '#0891b2', bg: '#cffafe', statuses: ['published'] },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Title level={3} className="!mb-0 !text-2xl">发布日历</Title>
          <Text type="secondary">统一管理节目排期、赞助口播和发布节奏，告别临时抱佛脚</Text>
        </div>
        <Space>
          <Segmented
            value={view}
            onChange={(v) => setView(v as any)}
            options={[
              { label: '日历视图', value: 'calendar' },
              { label: '看板视图', value: 'kanban' },
              { label: '时间线', value: 'timeline' },
            ]}
            size="small"
          />
          <Button type="primary" size="large" icon={<Plus size={16} />} onClick={() => setShowSchedule(true)}>
            新建排期
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={12} sm={6}>
          <StatCard
            label="本月排期"
            value={stats.thisMonth}
            sub={month.format('YYYY年 M 月')}
            icon={Calendar}
            color="#4361ee"
            bg="#eef2ff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            label="待发布"
            value={stats.pending}
            sub="制作已完成"
            icon={Rocket}
            color="#10b981"
            bg="#ecfdf5"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            label="即将上线"
            value={stats.scheduled}
            sub="有明确日期"
            icon={CalendarClock}
            color="#f59e0b"
            bg="#fef3c7"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            label="赞助口播"
            value={`${stats.doneSponsors}/${stats.totalSponsorSlots}`}
            sub="已确认 / 总数"
            icon={DollarSign}
            color="#8b5cf6"
            bg="#f5f3ff"
          />
        </Col>
      </Row>

      <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: '12px 20px' } }}>
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <Input
            prefix={<Search size={16} className="text-gray-400" />}
            placeholder="搜索标题 / 标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="large"
            className="!w-72"
            allowClear
          />
          <Space size="large" className="flex items-center">
            <div className="flex items-center gap-2">
              <Tag className="!rounded-full !mb-0" color="gold">
                <span className="status-dot" style={{ background: '#f59e0b' }} />
                筹备中
              </Tag>
              <Tag className="!rounded-full !mb-0" color="purple">
                <span className="status-dot" style={{ background: '#8b5cf6' }} />
                制作中
              </Tag>
              <Tag className="!rounded-full !mb-0" color="red">
                <span className="status-dot" style={{ background: '#ef4444' }} />
                审核中
              </Tag>
              <Tag className="!rounded-full !mb-0" color="green">
                <span className="status-dot" style={{ background: '#10b981' }} />
                待发布
              </Tag>
              <Tag className="!rounded-full !mb-0" color="cyan">
                <span className="status-dot" style={{ background: '#0891b2' }} />
                已发布
              </Tag>
            </div>
            {view === 'calendar' && (
              <div className="flex items-center gap-2">
                <Button
                  size="large"
                  type="text"
                  icon={<ChevronLeft size={18} />}
                  onClick={() => setMonth(month.subtract(1, 'month'))}
                />
                <span className="font-semibold text-gray-700 min-w-[120px] text-center">
                  {month.format('YYYY年 M月')}
                </span>
                <Button
                  size="large"
                  type="text"
                  icon={<ChevronRight size={18} />}
                  onClick={() => setMonth(month.add(1, 'month'))}
                />
                <Button size="large" onClick={() => setMonth(dayjs())}>今天</Button>
              </div>
            )}
          </Space>
        </div>
      </Card>

      {view === 'calendar' && (
        <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 12 } }}>
          <AntCalendar
            fullscreen
            cellRender={cellRender}
            value={month}
            onChange={setMonth}
            headerRender={() => null}
          />
        </Card>
      )}

      {view === 'kanban' && (
        <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 20 } }}>
          <div className="grid grid-cols-5 gap-4 min-h-[600px]">
            {kanbanColumns.map((col) => {
              const list = allScheduled.filter((e) => col.statuses.includes(e.status))
              return (
                <div key={col.key} className="flex flex-col rounded-2xl" style={{ backgroundColor: col.bg + '60' }}>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-white/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                      <span className="font-semibold text-gray-800">{col.label}</span>
                    </div>
                    <Badge
                      count={list.length}
                      style={{ backgroundColor: col.color, minWidth: 22, height: 22 }}
                    />
                  </div>
                  <div className="flex-1 p-2.5 space-y-2.5 overflow-auto">
                    {list.length === 0 ? (
                      <div className="h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                        暂无单集
                      </div>
                    ) : (
                      list.map((ep) => {
                        const cfg = STATUS_CONFIG[ep.status]
                        const progress = getProgress(ep)
                        const epMembers = ep.assigneeIds
                          .map((id) => members.find((m) => m.id === id)!)
                          .filter(Boolean)
                        return (
                          <Card
                            key={ep.id}
                            hoverable
                            size="small"
                            className="!rounded-xl cursor-pointer !border-0 shadow-sm"
                            onClick={() => setSelectedEp(ep)}
                            styles={{ body: { padding: 12 } }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Tag
                                className="!rounded-full !text-[10px] !mb-0 !px-2"
                                style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none' }}
                              >
                                EP{String(ep.number).padStart(3, '0')}
                              </Tag>
                              <span className="text-[10px] text-gray-400">
                                {formatDate(ep.scheduledDate, 'MM/DD')}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-snug min-h-[40px]">
                              {ep.title.replace(/^EP\d+\s*/, '')}
                            </div>
                            {ep.sponsorSlots.length > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <DollarSign size={12} className="text-amber-500" />
                                <span className="text-[11px] text-amber-600 font-medium">
                                  {ep.sponsorSlots.length} 个赞助
                                </span>
                              </div>
                            )}
                            <Progress
                              percent={progress.pct}
                              showInfo={false}
                              size="small"
                              strokeColor={cfg.color}
                              className="!mb-2"
                            />
                            <div className="flex -space-x-1.5">
                              {epMembers.slice(0, 3).map((m) => (
                                <Tooltip key={m.id} title={m.name}>
                                  <Avatar
                                    size={20}
                                    style={{
                                      backgroundColor: m.color,
                                      fontSize: 9,
                                      border: '2px solid white',
                                    }}
                                  >
                                    {m.name[0]}
                                  </Avatar>
                                </Tooltip>
                              ))}
                            </div>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {view === 'timeline' && (
        <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 24 } }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Title level={4} className="!mb-1">
                {month.format('YYYY年 M 月')} 发布排期
              </Title>
              <Text type="secondary">共 {monthList.length} 期节目安排</Text>
            </div>
            {monthList.length === 0 ? (
              <Empty description="本月暂无排期" />
            ) : (
              <div className="relative">
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-400 to-green-400 -translate-x-1/2"
                  aria-hidden
                />
                {monthList.map((ep, idx) => {
                  const cfg = STATUS_CONFIG[ep.status]
                  const leftSide = idx % 2 === 0
                  const progress = getProgress(ep)
                  const season = seasons.find((s) => s.id === ep.seasonId)
                  return (
                    <div
                      key={ep.id}
                      className={`relative flex items-stretch mb-8 ${
                        leftSide ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div className={`w-1/2 ${leftSide ? 'pr-10 text-right' : 'pl-10 text-left'}`}>
                        <Card
                          hoverable
                          className="!rounded-2xl cursor-pointer card-hover !border-0 shadow-sm"
                          onClick={() => setSelectedEp(ep)}
                          styles={{ body: { padding: 16 } }}
                        >
                          <div className={`flex items-center gap-2 mb-2 flex-wrap ${leftSide ? 'justify-end' : ''}`}>
                            <Tag
                              className="!rounded-full !mb-0"
                              style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none' }}
                            >
                              <span className="status-dot" style={{ background: cfg.dot }} />
                              {cfg.label}
                            </Tag>
                            <Tag color="blue" className="!rounded-full !mb-0">
                              {season?.name}
                            </Tag>
                          </div>
                          <div className="font-semibold text-gray-800 text-lg mb-1 leading-snug">
                            {ep.title}
                          </div>
                          {ep.subtitle && (
                            <div className="text-sm text-gray-500 mb-3">{ep.subtitle}</div>
                          )}
                          <Progress
                            percent={progress.pct}
                            size="small"
                            strokeColor={cfg.color}
                            className="!mb-2"
                          />
                          {ep.sponsorSlots.length > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-amber-600">
                              <DollarSign size={14} />
                              <span>赞助: {ep.sponsorSlots.length} 个 · 已完成 {ep.sponsorSlots.filter((s) => s.done).length}</span>
                            </div>
                          )}
                        </Card>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                        <div
                          className="w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-lg ring-4 ring-white"
                          style={{ backgroundColor: cfg.color }}
                        >
                          <div className="text-xs font-bold -mb-0.5">
                            {dayjs(ep.scheduledDate).format('MM')}月
                          </div>
                          <div className="text-lg font-bold leading-none -mt-0.5">
                            {dayjs(ep.scheduledDate).format('DD')}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      <Modal
        title={
          selectedEp ? (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: STATUS_CONFIG[selectedEp.status].bg,
                  color: STATUS_CONFIG[selectedEp.status].color,
                }}
              >
                <Rocket size={20} />
              </div>
              <div>
                <div className="font-semibold">
                  EP{String(selectedEp.number).padStart(3, '0')} · 发布详情
                </div>
                <div className="text-xs text-gray-400 font-normal">
                  {formatDate(selectedEp.scheduledDate)} 发布
                </div>
              </div>
            </div>
          ) : ''
        }
        open={!!selectedEp}
        onCancel={() => setSelectedEp(null)}
        footer={
          <Space>
            <Button onClick={() => setSelectedEp(null)}>关闭</Button>
            <Button onClick={() => navigate(`/episodes/${selectedEp?.id}`)}>
              打开单集工作台
            </Button>
            {selectedEp?.status === 'ready' && (
              <Button
                type="primary"
                icon={<Send size={14} />}
                onClick={() => {
                  if (selectedEp) {
                    updateEpisodeStatus(selectedEp.id, 'published')
                    message.success('节目状态已标记为「已发布」')
                  }
                }}
              >
                标记为已发布
              </Button>
            )}
          </Space>
        }
        width={720}
      >
        {selectedEp && (
          <div className="space-y-5">
            <Card size="small" className="!rounded-xl border-0 bg-gray-50">
              <div className="font-medium text-gray-800 mb-1">{selectedEp.title}</div>
              {selectedEp.subtitle && (
                <div className="text-sm text-gray-500">{selectedEp.subtitle}</div>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Tag
                  className="!rounded-full !mb-0"
                  style={{
                    backgroundColor: STATUS_CONFIG[selectedEp.status].bg,
                    color: STATUS_CONFIG[selectedEp.status].color,
                    border: 'none',
                  }}
                >
                  <span className="status-dot" style={{ background: STATUS_CONFIG[selectedEp.status].dot }} />
                  {STATUS_CONFIG[selectedEp.status].label}
                </Tag>
                <Tag className="!rounded-full !mb-0">
                  <Calendar size={11} className="inline mr-1" />
                  计划发布 {formatDate(selectedEp.scheduledDate)}
                </Tag>
                <Tag
                  className="!rounded-full !mb-0"
                  color={selectedEp.publishedDate ? 'green' : 'default'}
                >
                  {selectedEp.publishedDate ? `✓ 已发布 ${formatDate(selectedEp.publishedDate)}` : '未设置发布日期'}
                </Tag>
                <Tag className="!rounded-full !mb-0">
                  截止 {formatDate(selectedEp.deadline)}
                </Tag>
                <Tag className="!rounded-full !mb-0">
                  进度 {getProgress(selectedEp).pct}%
                </Tag>
              </div>
            </Card>
            <Card
              size="small"
              className="!rounded-xl border-0"
              title={
                <span className="flex items-center gap-2">
                  <DollarSign size={14} className="text-amber-500" />
                  💰 赞助口播排期 ({selectedEp.sponsorSlots.length} 个)
                </span>
              }
              extra={<Button size="small" icon={<Plus size={12} />}>添加口播</Button>}
            >
              {selectedEp.sponsorSlots.length === 0 ? (
                <Empty description="暂无赞助安排" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <List
                  dataSource={selectedEp.sponsorSlots}
                  renderItem={(s) => (
                    <List.Item className="!py-3 !px-0 !border-b !border-gray-100 last:!border-0">
                      <div className="w-full flex items-center gap-4">
                        <Tag
                          color={
                            s.type === 'pre' ? 'blue' : s.type === 'mid' ? 'purple' : 'green'
                          }
                          className="!rounded-full !mb-0"
                        >
                          {s.type === 'pre' ? '片头' : s.type === 'mid' ? '片中' : '片尾'}
                        </Tag>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800">{s.sponsor}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {s.position} · {s.duration}
                          </div>
                        </div>
                        <Tag.CheckableTag checked={s.done}>
                          {s.done ? '✓ 已录制' : '待录制'}
                        </Tag.CheckableTag>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
            <Card
              size="small"
              className="!rounded-xl border-0"
              title={
                <span className="flex items-center gap-2">
                  <Users size={14} className="text-primary-500" />
                  🎯 发布平台
                </span>
              }
            >
              <div className="flex flex-wrap gap-2">
                {(selectedEp.publishCheck.platforms || ['小宇宙', '苹果播客']).map((p) => (
                  <Tag
                    key={p}
                    color="blue"
                    className="!rounded-full !text-sm !px-3 !py-1"
                  >
                    {p}
                  </Tag>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title="新建发布排期"
        open={showSchedule}
        onCancel={() => setShowSchedule(false)}
        onOk={() => form.submit()}
        okText="创建排期"
        width={640}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={() => {
            setShowSchedule(false)
            form.resetFields()
            message.success('排期已创建')
          }}
        >
          <Form.Item label="关联单集" name="episodeId" rules={[{ required: true }]}>
            <Select
              size="large"
              placeholder="选择一个单集或创建新单集"
              options={episodes.slice(0, 10).map((e) => ({
                value: e.id,
                label: `EP${String(e.number).padStart(3, '0')} ${e.title.slice(0, 30)}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="发布日期" name="scheduledDate" rules={[{ required: true }]}>
            <Input type="date" size="large" />
          </Form.Item>
          <Form.Item label="负责人" name="assignee" rules={[{ required: true }]}>
            <Select
              size="large"
              placeholder="指定发布负责人"
              options={members.map((m) => ({
                value: m.id,
                label: (
                  <div className="flex items-center gap-2">
                    <Avatar size={18} style={{ backgroundColor: m.color, fontSize: 9 }}>
                      {m.name[0]}
                    </Avatar>
                    {m.name} <span className="text-gray-400">· {m.role}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={2} placeholder="例如：周五 18:00 准点推送" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

function useApp() {
  return AntApp.useApp()
}
