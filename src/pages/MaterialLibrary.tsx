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
  Upload,
  Segmented,
  Tooltip,
  Modal,
  Form,
  Select,
  Descriptions,
  App as AntApp,
  Radio,
  Progress,
} from 'antd'
import {
  Search,
  Plus,
  FolderOpen,
  Mic,
  Image,
  Video,
  FileText,
  Upload as UploadIcon,
  MoreHorizontal,
  Download,
  Trash2,
  Clock,
  Filter,
  ChevronDown,
  Edit3,
  File,
  HardDrive,
  Music,
  Calendar,
} from 'lucide-react'
import { useStore } from '@/store'
import { formatDate, initials } from '@/utils'
import type { MaterialAsset } from '@/types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  all: { label: '全部', icon: FolderOpen, color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  audio: { label: '音频', icon: Mic, color: '#4361ee', bg: '#eef2ff', border: '#c7d2fe' },
  image: { label: '图片', icon: Image, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  video: { label: '视频', icon: Video, color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  document: { label: '文档', icon: FileText, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  other: { label: '其他', icon: File, color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
}

export default function MaterialLibrary() {
  const materials = useStore((s) => s.materials)
  const members = useStore((s) => s.members)
  const episodes = useStore((s) => s.episodes)
  const { message } = AntApp.useApp()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [view, setView] = useState<'card' | 'list'>('card')
  const [selected, setSelected] = useState<MaterialAsset | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form] = Form.useForm()

  const stats = useMemo(() => {
    const countByType: Record<string, number> = {}
    let totalSize = 0
    materials.forEach((m) => {
      countByType[m.type] = (countByType[m.type] || 0) + 1
      const match = m.size.match(/([\d.]+)\s*(MB|GB|KB)/)
      if (match) {
        const n = parseFloat(match[1])
        const unit = match[2]
        if (unit === 'GB') totalSize += n * 1024
        else if (unit === 'MB') totalSize += n
        else totalSize += n / 1024
      }
    })
    return {
      total: materials.length,
      audio: countByType.audio || 0,
      image: countByType.image || 0,
      video: countByType.video || 0,
      document: countByType.document || 0,
      other: countByType.other || 0,
      sizeGB: (totalSize / 1024).toFixed(2),
    }
  }, [materials])

  const filtered = useMemo(() => {
    let list = materials
    if (typeFilter !== 'all') list = list.filter((m) => m.type === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.notes.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return list.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  }, [materials, search, typeFilter])

  const uploader = (id: string) => members.find((m) => m.id === id)
  const episodeName = (id?: string) => {
    if (!id) return null
    const e = episodes.find((ep) => ep.id === id)
    return e ? `EP${String(e.number).padStart(3, '0')} ${e.title.slice(0, 20)}` : null
  }

  const FileIcon = ({ m }: { m: MaterialAsset }) => {
    const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.other
    return (
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ background: cfg.bg }}>
        <cfg.icon size={28} style={{ color: cfg.color }} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Title level={3} className="!mb-0 !text-2xl">素材库</Title>
          <Text type="secondary">统一管理所有节目素材，不用在网盘和本地文件夹之间来回找</Text>
        </div>
        <Space>
          <Upload directory>
            <Button size="large" icon={<UploadIcon size={16} />}>批量导入</Button>
          </Upload>
          <Button type="primary" size="large" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
            登记素材
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={12} md={6}>
          <Card className="card-hover !rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">素材总数</div>
                <div className="text-3xl font-bold text-gray-900 mt-0.5">{stats.total}</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <HardDrive size={22} className="text-gray-600" />
              </div>
            </div>
            <Progress percent={72} showInfo={false} size="small" className="!mt-4" />
            <div className="text-xs text-gray-400 mt-1">已使用 {stats.sizeGB} GB</div>
          </Card>
        </Col>
        {['audio', 'image', 'video'].map((t) => {
          const cfg = TYPE_CONFIG[t]
          return (
            <Col xs={12} md={6} key={t}>
              <Card
                className="card-hover !rounded-2xl border-0 shadow-sm cursor-pointer"
                onClick={() => setTypeFilter(t)}
                styles={{ body: { padding: 16 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{cfg.label}</div>
                    <div className="text-3xl font-bold mt-0.5" style={{ color: cfg.color }}>
                      {stats[t as keyof typeof stats] as number}
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                    <cfg.icon size={22} style={{ color: cfg.color }} />
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                  {typeFilter === t ? '● 已筛选' : '点击筛选'}
                  {typeFilter === t && <ChevronDown size={12} />}
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: '12px 20px' } }}>
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              prefix={<Search size={16} className="text-gray-400" />}
              placeholder="搜索文件名 / 标签 / 备注..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="large"
              className="!w-80"
              allowClear
            />
            <div className="flex items-center gap-1">
              {Object.entries(TYPE_CONFIG).map(([k, cfg]) => (
                <Button
                  key={k}
                  type={typeFilter === k ? 'primary' : 'default'}
                  size="large"
                  className="!flex !items-center !gap-1.5"
                  onClick={() => setTypeFilter(k)}
                >
                  <cfg.icon size={14} />
                  {cfg.label}
                </Button>
              ))}
            </div>
          </div>
          <Segmented
            value={view}
            onChange={(v) => setView(v as any)}
            options={[
              { label: '卡片视图', value: 'card' },
              { label: '列表视图', value: 'list' },
            ]}
            size="small"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="!rounded-2xl border-0 shadow-sm">
          <Empty description="没有找到匹配的素材" />
        </Card>
      ) : view === 'card' ? (
        <Row gutter={[16, 16]}>
          {filtered.map((m) => {
            const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.other
            const up = uploader(m.uploadedBy)
            const epName = episodeName(m.episodeId)
            return (
              <Col xs={24} sm={12} md={8} xl={6} key={m.id}>
                <Card
                  hoverable
                  className="card-hover !rounded-2xl border-0 shadow-sm overflow-hidden group"
                  onClick={() => setSelected(m)}
                  styles={{ body: { padding: 16 } }}
                >
                  <div className="relative mb-3">
                    <div
                      className={`aspect-video rounded-xl flex items-center justify-center relative overflow-hidden`}
                      style={{ background: cfg.bg + '80' }}
                    >
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${cfg.color}30 0%, transparent 60%)`,
                        }}
                      />
                      {m.type === 'image' ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${cfg.color}aa, ${cfg.color}44)`,
                          }}
                        />
                      ) : null}
                      <cfg.icon
                        size={40}
                        style={{ color: cfg.color }}
                        className="relative z-10 drop-shadow-sm"
                      />
                      {m.type === 'audio' && m.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs font-mono backdrop-blur-sm">
                          {m.duration}
                        </div>
                      )}
                      {m.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg pl-1">
                            <cfg.icon size={26} style={{ color: cfg.color }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 line-clamp-1 mb-1">{m.name}</div>
                  <div className="text-xs text-gray-400 mb-3 flex items-center gap-1.5 flex-wrap">
                    <span>{m.size}</span>
                    {m.duration && <><span>·</span><span>{m.duration}</span></>}
                    {m.resolution && <><span>·</span><span>{m.resolution}</span></>}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3 min-h-[22px]">
                    {m.tags.slice(0, 3).map((t) => (
                      <Tag key={t} color={cfg.color} style={{ borderColor: cfg.border, background: cfg.bg, color: cfg.color }} className="!rounded !text-[10px] !mb-0 !h-5 !leading-4">
                        {t}
                      </Tag>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Avatar size={16} style={{ backgroundColor: up?.color, fontSize: 9 }}>
                        {up?.name?.[0]}
                      </Avatar>
                      {up?.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(m.uploadedAt, 'MM/DD')}
                    </div>
                  </div>
                  {epName && (
                    <Tooltip title={`关联到: ${epName}`}>
                      <div className="mt-2 p-2 rounded-lg bg-primary-50 text-xs text-primary-700 border border-primary-100 line-clamp-1">
                        🔗 {epName}
                      </div>
                    </Tooltip>
                  )}
                </Card>
              </Col>
            )
          })}
        </Row>
      ) : (
        <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 0 } }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-5 py-3 font-medium">素材</th>
                  <th className="px-5 py-3 font-medium">类型</th>
                  <th className="px-5 py-3 font-medium">大小 / 时长</th>
                  <th className="px-5 py-3 font-medium">标签</th>
                  <th className="px-5 py-3 font-medium">关联单集</th>
                  <th className="px-5 py-3 font-medium">上传者</th>
                  <th className="px-5 py-3 font-medium">上传时间</th>
                  <th className="px-5 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.other
                  const up = uploader(m.uploadedBy)
                  const epName = episodeName(m.episodeId)
                  return (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelected(m)}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                            <cfg.icon size={18} style={{ color: cfg.color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 line-clamp-1">{m.name}</div>
                            {m.notes && <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{m.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Tag color={cfg.color} className="!rounded-full">{cfg.label}</Tag>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        <div>{m.size}</div>
                        <div className="text-xs text-gray-400">{m.duration || m.resolution || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {m.tags.slice(0, 2).map((t) => (
                            <Tag key={t} className="!rounded !text-xs !mb-0">{t}</Tag>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{epName || '全局'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar size={22} style={{ backgroundColor: up?.color, fontSize: 10 }}>
                            {up?.name?.[0]}
                          </Avatar>
                          <span className="text-sm text-gray-600">{up?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(m.uploadedAt)}</td>
                      <td className="px-5 py-3.5">
                        <Space size="small">
                          <Button size="small" type="text" icon={<Download size={12} />}>下载</Button>
                          <Button size="small" type="text" danger icon={<Trash2 size={12} />} />
                        </Space>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        title={
          selected ? (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: TYPE_CONFIG[selected.type]?.bg || '#f3f4f6' }}
              >
                <FolderOpen size={20} style={{ color: TYPE_CONFIG[selected.type]?.color || '#6b7280' }} />
              </div>
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-xs text-gray-400 font-normal">素材详情</div>
              </div>
            </div>
          ) : ''
        }
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={
          <Space>
            <Button onClick={() => setSelected(null)}>关闭</Button>
            <Button icon={<Download size={14} />}>下载文件</Button>
            <Button type="primary" icon={<Edit3 size={14} />}>编辑信息</Button>
          </Space>
        }
        width={680}
      >
        {selected && (
          <div className="space-y-5">
            <div
              className="aspect-video rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: (TYPE_CONFIG[selected.type]?.bg || '#f3f4f6') + '80' }}
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  background: `radial-gradient(circle at 40% 40%, ${TYPE_CONFIG[selected.type]?.color || '#6b7280'}30 0%, transparent 60%)`,
                }}
              />
              <FolderOpen
                size={64}
                className="relative z-10 drop-shadow-sm"
                style={{ color: TYPE_CONFIG[selected.type]?.color || '#6b7280' }}
              />
            </div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="文件路径" span={2}>
                <code className="text-xs bg-gray-50 px-2 py-1 rounded">{selected.path}</code>
              </Descriptions.Item>
              <Descriptions.Item label="文件类型">
                <Tag color={TYPE_CONFIG[selected.type]?.color} className="!rounded-full">
                  {TYPE_CONFIG[selected.type]?.label || '其他'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="文件大小">{selected.size}</Descriptions.Item>
              {selected.duration && <Descriptions.Item label="时长">{selected.duration}</Descriptions.Item>}
              {selected.resolution && <Descriptions.Item label="分辨率">{selected.resolution}</Descriptions.Item>}
              <Descriptions.Item label="关联单集" span={2}>
                {episodeName(selected.episodeId) || <span className="text-gray-400">全局公共素材</span>}
              </Descriptions.Item>
              <Descriptions.Item label="上传者" span={2}>
                {(() => {
                  const u = uploader(selected.uploadedBy)
                  return (
                    <div className="flex items-center gap-2">
                      <Avatar size={20} style={{ backgroundColor: u?.color, fontSize: 10 }}>
                        {u?.name?.[0]}
                      </Avatar>
                      <span className="text-sm">{u?.name}</span>
                      <span className="text-xs text-gray-400">于 {formatDate(selected.uploadedAt)} 上传</span>
                    </div>
                  )
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="标签" span={2}>
                <Space wrap>
                  {selected.tags.map((t) => (
                    <Tag key={t} color="blue">{t}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                <Paragraph className="!mb-0">{selected.notes || '暂无备注'}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="登记新素材"
        open={showAdd}
        onCancel={() => setShowAdd(false)}
        onOk={() => form.submit()}
        okText="保存"
        width={640}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={() => {
            setShowAdd(false)
            form.resetFields()
            message.success('素材已登记')
          }}
        >
          <Upload.Dragger multiple className="!mb-4">
            <p className="ant-upload-drag-icon"><UploadIcon size={40} className="text-primary-500" /></p>
            <p className="ant-upload-text text-sm font-medium">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint text-xs text-gray-400">
              支持音频 / 图片 / 视频 / 文档等，单个文件最大 2GB
            </p>
          </Upload.Dragger>
          <Form.Item label="素材类型" name="type" rules={[{ required: true }]} initialValue="audio">
            <Radio.Group>
              {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'all').map(([k, cfg]) => (
                <Radio.Button key={k} value={k}>
                  <cfg.icon size={12} /> {cfg.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="素材名称" name="name" rules={[{ required: true }]}>
            <Input size="large" placeholder="给素材起个好记的名字" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="标签" name="tags" rules={[{ required: true }]}>
                <Select mode="tags" size="large" placeholder="输入后回车，例如：BGM、封面、赞助" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="关联单集" name="episodeId">
                <Select
                  size="large"
                  allowClear
                  placeholder="可选：关联到某一期节目"
                  options={episodes.slice(0, 10).map((e) => ({
                    value: e.id,
                    label: `EP${String(e.number).padStart(3, '0')} ${e.title.slice(0, 25)}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注说明" name="notes">
            <TextArea rows={2} placeholder="方便团队理解用途的补充说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
