import { ipcRenderer } from 'electron'

const windowAPI = {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
}

;(window as any).windowAPI = windowAPI
;(window as any).ipcRenderer = ipcRenderer
