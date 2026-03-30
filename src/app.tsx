import { PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

// 云开发环境 ID，需要替换为你自己的环境 ID
const CLOUD_ENV = process.env.NODE_ENV === 'production' 
  ? 'your-prod-env-id'  // 生产环境
  : 'your-dev-env-id'   // 开发环境

function App({ children }: PropsWithChildren) {
  // 初始化云开发
  Taro.cloud?.init({
    env: CLOUD_ENV,
    traceUser: true
  })
  
  return children
}

export default App
