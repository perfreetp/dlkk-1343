import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Input, Badge } from 'antd'
import {
  LayoutDashboard,
  Workflow,
  Users,
  FolderOpen,
  FileCheck,
  Calendar,
  BarChart3,
  Search,
  Bell,
  ChevronDown,
  Minus,
  Square,
  X,
  Radio,
} from 'lucide-react'
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import EpisodeWorkspace from '@/pages/EpisodeWorkspace'
import GuestLibrary from '@/pages/GuestLibrary'
import MaterialLibrary from '@/pages/MaterialLibrary'
import ReviewCenter from '@/pages/ReviewCenter'
import PublishCalendar from '@/pages/PublishCalendar'
import Archive from '@/pages/Archive'
import { useStore } from '@/store'
import { initials } from '@/utils'

const { Sider, Header, Content } = Layout

const MENU_ITEMS = [
  { key: '/', icon: LayoutDashboard, label: '节目看板', desc: '全局概览' },
  { key: '/episodes', icon: Workflow, label: '单集工作台', desc: '制作流程' },
  { key: '/guests', icon: Users, label: '嘉宾库', desc: '人脉管理' },
  { key: '/materials', icon: FolderOpen, label: '素材库', desc: '文件资源' },
  { key: '/review', icon: FileCheck, label: '审核中心', desc: '反馈迭代' },
  { key: '/calendar', icon: Calendar, label: '发布日历', desc: '排期计划' },
  { key: '/archive', icon: BarChart3, label: '统计归档', desc: '数据沉淀' },
]

function TitleBar() {
  return (
    <div className="h-10 bg-[#16213e] flex items-center justify-between px-4 drag-region text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <Radio size={16} className="text-primary-400" />
        <span className="font-medium text-gray-200">Podcast Studio</span>
        <span className="text-xs text-gray-500 ml-2">播客团队工作平台</span>
      </div>
      <div className="flex items-center gap-1 no-drag-region">
        <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition">
          <Minus size={16} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition">
          <Square size={14} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-red-500/80 transition text-red-300 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = MENU_ITEMS.some((m) => location.pathname.startsWith(m.key) && m.key !== '/')
    ? MENU_ITEMS.find((m) => location.pathname.startsWith(m.key) && m.key !== '/')!.key
    : location.pathname === '/' || location.pathname === ''
    ? '/'
    : '/episodes'

  return (
    <Sider width={240} className="!bg-[#1a1a2e]" theme="dark">
      <div className="px-5 py-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Radio size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">Podcast Studio</div>
            <div className="text-xs text-gray-400 mt-0.5">S3 · 进行中</div>
          </div>
        </Link>
      </div>
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-5 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          工作台
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          items={MENU_ITEMS.map((m) => ({
            key: m.key,
            icon: <m.icon size={18} />,
            label: (
              <div className="flex items-center justify-between py-0.5">
                <div>
                  <div className="font-medium">{m.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                </div>
              </div>
            ),
          }))}
          style={{ borderInlineEnd: 'none', background: 'transparent' }}
        />
      </div>
      <div className="px-4 py-4 border-t border-white/5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-podcast-accent/20 to-podcast-gold/10 border border-white/5">
          <div className="text-xs text-gray-300 mb-1">本周目标</div>
          <div className="text-white font-semibold">3 期节目上线</div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-podcast-accent to-podcast-gold" style={{ width: '66%' }} />
          </div>
          <div className="text-xs text-gray-400 mt-1.5">2 / 3 已完成</div>
        </div>
      </div>
    </Sider>
  )
}

function TopBar() {
  const members = useStore((s) => s.members)
  const currentMember = members[0]
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <Header className="!bg-white !h-16 !px-6 flex items-center justify-between border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-6">
        <Input
          prefix={<Search size={16} className="text-gray-400" />}
          placeholder="搜索单集 / 嘉宾 / 素材..."
          className="!w-80"
          size="large"
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          allowClear
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m) => (
            <Avatar
              key={m.id}
              size={32}
              style={{ backgroundColor: m.color, border: '2px solid white', fontSize: 12 }}
            >
              {initials(m.name)}
            </Avatar>
          ))}
          {members.length > 4 && (
            <Avatar size={32} style={{ backgroundColor: '#e5e7eb', color: '#6b7280', border: '2px solid white', fontSize: 12 }}>
              +{members.length - 4}
            </Avatar>
          )}
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell size={20} className="text-gray-600" />
          <Badge count={3} size="small" style={{ backgroundColor: '#ef4444' }} />
        </button>
        <Dropdown
          menu={{
            items: [
              { key: 'profile', label: '个人资料' },
              { key: 'team', label: '团队管理' },
              { key: 'settings', label: '偏好设置' },
              { type: 'divider' },
              { key: 'logout', label: '退出登录', danger: true },
            ],
          }}
          placement="bottomRight"
        >
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition">
            <Avatar size={36} style={{ backgroundColor: currentMember.color, fontSize: 14 }}>
              {initials(currentMember.name)}
            </Avatar>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">{currentMember.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {currentMember.role} <ChevronDown size={12} />
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}

export default function App() {
  return (
    <div className="w-full h-full flex flex-col bg-[#16213e]">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        <Layout className="!bg-transparent flex-1">
          <Sidebar />
          <Layout className="!bg-[#f5f7fa] flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <Content className="flex-1 overflow-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/episodes" element={<EpisodeWorkspace />} />
                <Route path="/episodes/:id" element={<EpisodeWorkspace />} />
                <Route path="/guests" element={<GuestLibrary />} />
                <Route path="/materials" element={<MaterialLibrary />} />
                <Route path="/review" element={<ReviewCenter />} />
                <Route path="/calendar" element={<PublishCalendar />} />
                <Route path="/archive" element={<Archive />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </div>
    </div>
  )
}
