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
  Descriptions,
  Modal,
  Typography,
  Empty,
  List,
  Divider,
  Form,
  Select,
  Upload,
  Rate,
  Segmented,
  Tooltip,
  Badge,
  Timeline,
  App as AntApp,
} from 'antd'
import {
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  Star,
  MoreHorizontal,
  Edit3,
  Trash2,
  Clock,
  FileText,
  ChevronRight,
  History,
  Target,
} from 'lucide-react'
import { useStore } from '@/store'
import { formatDate, initials } from '@/utils'
import type { Guest } from '@/types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function GuestLibrary() {
  const guests = useStore((s) => s.guests)
  const episodes = useStore((s) => s.episodes)
  const { message } = AntApp.useApp()
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<string | 'all'>('all')
  const [selected, setSelected] = useState<Guest | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form] = Form.useForm()

  const allTags = useMemo(() => {
    const set = new Set<string>()
    guests.forEach((g) => g.tags.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [guests])

  const filtered = useMemo(() => {
    let list = guests
    if (filterTag !== 'all') list = list.filter((g) => g.tags.includes(filterTag))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.company.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return list.sort((a, b) => b.history.length - a.history.length)
  }, [guests, search, filterTag])

  const contactIcon = (type: string) => {
    const map: Record<string, any> = {
      微信: MessageCircle,
      邮箱: Mail,
      电话: Phone,
      Twitter: Globe,
      小红书: Globe,
      公众号: FileText,
    }
    return map[type] || Mail
  }

  const GuestStats = () => {
    const total = guests.length
    const active = guests.filter((g) => g.history.length > 0).length
    const repeat = guests.filter((g) => g.history.length > 1).length
    return (
      <Row gutter={16} className="mb-5">
        {[
          { label: '嘉宾总数', value: total, color: '#4361ee', bg: '#eef2ff', icon: Target },
          { label: '合作过', value: active, color: '#10b981', bg: '#ecfdf5', icon: Star },
          { label: '复购嘉宾', value: repeat, color: '#f59e0b', bg: '#fef3c7', icon: History },
          { label: '主题标签', value: allTags.length, color: '#8b5cf6', bg: '#f5f3ff', icon: Filter },
        ].map((s) => (
          <Col xs={12} md={6} key={s.label}>
            <Card className="card-hover !rounded-2xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon size={22} style={{ color: s.color }} />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Title level={3} className="!mb-0 !text-2xl">嘉宾库</Title>
          <Text type="secondary">管理和沉淀所有嘉宾资源，别让宝藏人脉散落在聊天记录里</Text>
        </div>
        <Space>
          <Button type="primary" size="large" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
            添加新嘉宾
          </Button>
        </Space>
      </div>

      <GuestStats />

      <Card className="!rounded-2xl border-0 shadow-sm" styles={{ body: { padding: '12px 20px' } }}>
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            prefix={<Search size={16} className="text-gray-400" />}
            placeholder="搜索嘉宾姓名 / 公司 / 标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="large"
            className="!w-80"
            allowClear
          />
          <div className="flex items-center gap-1 flex-wrap flex-1">
            <Tag.CheckableTag checked={filterTag === 'all'} onChange={() => setFilterTag('all')}>
              全部标签
            </Tag.CheckableTag>
            {allTags.slice(0, 12).map((t) => (
              <Tag.CheckableTag
                key={t}
                checked={filterTag === t}
                onChange={() => setFilterTag(t)}
              >
                #{t}
              </Tag.CheckableTag>
            ))}
            {allTags.length > 12 && (
              <Tooltip title={`还有 ${allTags.length - 12} 个标签`}>
                <Tag className="!rounded-full">+{allTags.length - 12}</Tag>
              </Tooltip>
            )}
          </div>
          <Segmented
            options={[
              { label: '卡片视图', value: 'card' },
              { label: '列表视图', value: 'list' },
            ]}
            defaultValue="card"
            size="small"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="!rounded-2xl border-0 shadow-sm">
          <Empty description="没有找到匹配的嘉宾" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((g) => {
            const eps = g.history.map((h) => episodes.find((e) => e.id === h.episodeId)!).filter(Boolean)
            const avgRating = 4 + (g.history.length % 3) * 0.5
            return (
              <Col xs={24} md={12} xl={8} key={g.id}>
                <Card
                  hoverable
                  className="card-hover !rounded-2xl border-0 shadow-sm overflow-hidden !transition"
                  onClick={() => setSelected(g)}
                  styles={{ body: { padding: 0 } }}
                >
                  <div className="h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'radial-gradient(circle at 30% 20%, white 0%, transparent 50%)'
                    }} />
                    <div className="absolute bottom-0 right-4 flex items-center gap-1 text-xs text-white/90 mb-2">
                      <History size={12} />
                      {g.history.length} 期合作
                    </div>
                  </div>
                  <div className="px-5 pb-5 -mt-8 relative">
                    <div className="flex items-end justify-between mb-3">
                      <Avatar size={64} style={{ backgroundColor: '#6366f1', fontSize: 22, border: '4px solid white' }}>
                        {initials(g.name)}
                      </Avatar>
                      <Rate disabled allowHalf defaultValue={avgRating} className="!text-xs !mb-0" />
                    </div>
                    <Title level={5} className="!mb-0.5 !text-lg">{g.name}</Title>
                    <div className="text-sm text-gray-600 mb-1">{g.title}</div>
                    <div className="text-xs text-gray-400 mb-3">{g.company}</div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {g.tags.slice(0, 4).map((t) => (
                        <Tag key={t} className="!rounded !text-xs !mb-0">#{t}</Tag>
                      ))}
                      {g.tags.length > 4 && <Tag className="!rounded !text-xs !mb-0">+{g.tags.length - 4}</Tag>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex -space-x-1">
                        {g.contacts.slice(0, 3).map((c, i) => {
                          const Icon = contactIcon(c.type)
                          return (
                            <Tooltip key={i} title={`${c.type}: ${c.value}`}>
                              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 transition">
                                <Icon size={14} />
                              </div>
                            </Tooltip>
                          )
                        })}
                      </div>
                      <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setSelected(g) }}>
                        查看详情 <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      <Modal
        title={null}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={
          <Space>
            <Button onClick={() => setSelected(null)}>关闭</Button>
            <Button icon={<Edit3 size={14} />}>编辑资料</Button>
            <Button type="primary">安排合作</Button>
          </Space>
        }
        width={820}
        styles={{ body: { padding: 0 } }}
      >
        {selected && (
          <div>
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 30% 20%, white 0%, transparent 50%), radial-gradient(circle at 70% 80%, white 0%, transparent 50%)'
              }} />
            </div>
            <div className="px-8 pb-8 -mt-12 relative">
              <div className="flex items-end justify-between mb-4">
                <div className="flex items-end gap-4">
                  <Avatar size={88} style={{ backgroundColor: '#6366f1', fontSize: 30, border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    {initials(selected.name)}
                  </Avatar>
                  <div className="pb-2">
                    <Title level={3} className="!mb-0.5">
                      {selected.name}
                      <Rate disabled allowHalf defaultValue={4.5} className="!text-sm ml-3 !mb-0" />
                    </Title>
                    <div className="text-gray-600">{selected.title}</div>
                    <div className="text-sm text-gray-400">{selected.company}</div>
                  </div>
                </div>
                <Space>
                  <Button icon={<Edit3 size={14} />} size="large">编辑</Button>
                  <Button danger icon={<Trash2 size={14} />} size="large" />
                </Space>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selected.tags.map((t) => (
                  <Tag key={t} color="blue" className="!rounded-full !text-sm !px-3 !py-0.5">
                    #{t}
                  </Tag>
                ))}
              </div>

              <Row gutter={24}>
                <Col xs={24} md={14}>
                  <Card title="👤 基本资料" size="small" className="!rounded-xl mb-4">
                    <Descriptions column={1} size="small" labelStyle={{ width: 80 }}>
                      <Descriptions.Item label="个人简介">
                        <Paragraph className="!mb-0 leading-relaxed">{selected.bio}</Paragraph>
                      </Descriptions.Item>
                      <Descriptions.Item label="加入档案">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {formatDate(selected.createdAt)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="合作次数">
                        <Badge count={selected.history.length} style={{ backgroundColor: '#4361ee' }} offset={[4, 0]}>
                          <span className="ml-1">期节目</span>
                        </Badge>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card
                    title={
                      <span className="flex items-center gap-2">
                        <History size={14} />
                        合作历史
                      </span>
                    }
                    size="small"
                    className="!rounded-xl"
                  >
                    {selected.history.length === 0 ? (
                      <Empty description="还没有合作过，邀请 TA 吧！" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <Timeline
                        items={selected.history.map((h, i) => ({
                          color: i === 0 ? 'blue' : 'gray',
                          children: (
                            <div className="pb-2">
                              <div className="font-medium text-gray-800">{h.episodeTitle}</div>
                              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Clock size={10} />
                                {formatDate(h.date)}
                              </div>
                            </div>
                          ),
                        }))}
                      />
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={10}>
                  <Card
                    title={
                      <span className="flex items-center gap-2">
                        <Mail size={14} />
                        联系方式
                      </span>
                    }
                    size="small"
                    className="!rounded-xl mb-4"
                  >
                    <List
                      dataSource={selected.contacts}
                      renderItem={(c, i) => {
                        const Icon = contactIcon(c.type)
                        return (
                          <List.Item className="!py-2.5 !px-0">
                            <div className="w-full flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-400">{c.type}</div>
                                <div className="text-sm text-gray-800 font-medium truncate">
                                  <Text copyable={{ text: c.value }}>{c.value}</Text>
                                </div>
                              </div>
                            </div>
                          </List.Item>
                        )
                      }}
                    />
                  </Card>

                  <Card
                    title={
                      <span className="flex items-center gap-2">
                        <FileText size={14} />
                        内部备注
                      </span>
                    }
                    size="small"
                    className="!rounded-xl"
                  >
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-gray-700 leading-relaxed">
                      {selected.notes || '暂无备注，写下合作注意事项吧～'}
                    </div>
                    <Button type="link" size="small" className="!mt-2 !px-0" icon={<Edit3 size={12} />}>
                      编辑备注
                    </Button>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="添加嘉宾档案"
        open={showAdd}
        onCancel={() => setShowAdd(false)}
        onOk={() => form.submit()}
        okText="保存档案"
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={() => {
            setShowAdd(false)
            form.resetFields()
            message.success('嘉宾档案已创建')
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
                <Input size="large" placeholder="嘉宾姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="职位 / 头衔" name="title" rules={[{ required: true }]}>
                <Input size="large" placeholder="例如：产品总监" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="所在公司 / 机构" name="company">
            <Input size="large" />
          </Form.Item>
          <Form.Item label="标签" name="tags" rules={[{ required: true, message: '至少添加 1 个领域标签' }]}>
            <Select mode="tags" size="large" placeholder="输入标签后回车，例如：AI、创业、投资" />
          </Form.Item>
          <Form.Item label="个人简介" name="bio" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="给团队一个快速了解 TA 的介绍" />
          </Form.Item>
          <Divider>联系方式（至少 1 个）</Divider>
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item label="微信" name="wechat"><Input size="large" /></Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Form.Item label="邮箱" name="email"><Input size="large" placeholder="email@example.com" /></Form.Item>
            </Col>
          </Row>
          <Form.Item label="其他联系方式" name="otherContact">
            <Input size="large" placeholder="格式：类型-值，例如 Twitter-@xxx" />
          </Form.Item>
          <Form.Item label="合作注意事项 / 内部备注" name="notes">
            <TextArea rows={2} placeholder="例如：时间难约、说话偏学术需要引导、怕冷场..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
