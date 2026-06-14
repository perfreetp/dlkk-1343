import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App'
import './index.css'

dayjs.locale('zh-cn')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#4361ee',
            borderRadius: 8,
            colorInfo: '#4361ee',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#1a1a2e',
              bodyBg: '#f5f7fa',
            },
            Menu: {
              darkItemBg: 'transparent',
              darkSubMenuItemBg: 'transparent',
              darkItemColor: '#94a3b8',
              darkItemSelectedBg: '#4361ee',
              darkItemHoverBg: 'rgba(67, 97, 238, 0.1)',
            },
            Card: {
              headerBg: 'transparent',
            },
          },
        }}
      >
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </HashRouter>
  </React.StrictMode>,
)
