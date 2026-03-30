/**
 * 用户类型定义
 */

// 用户设置
export interface UserSettings {
  // 默认书房 ID
  defaultLibraryId?: string
  // 主题：light / dark / auto
  theme: 'light' | 'dark' | 'auto'
  // 是否开启价格显示
  showPrice: boolean
  // 默认视图模式
  defaultViewMode: 'shelf' | 'list'
  // 通知设置
  notifications: {
    priceAlert: boolean  // 价格波动提醒
    newFeature: boolean  // 新功能通知
  }
}

// 用户信息
export interface User {
  _id: string
  // 微信 OpenID
  openid: string
  // 昵称
  nickname: string
  // 头像 URL
  avatarUrl: string
  // 用户设置
  settings: UserSettings
  // 统计信息
  stats: {
    libraryCount: number  // 书房数量
    itemCount: number     // 藏品总数
    totalValue: number    // 总价值
  }
  // 创建时间
  createdAt: Date
  // 更新时间
  updatedAt: Date
}

// 创建用户参数
export interface CreateUserParams {
  openid: string
  nickname?: string
  avatarUrl?: string
}

// 更新用户参数
export interface UpdateUserParams {
  nickname?: string
  avatarUrl?: string
  settings?: Partial<UserSettings>
}

// 默认用户设置
export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'light',
  showPrice: true,
  defaultViewMode: 'shelf',
  notifications: {
    priceAlert: true,
    newFeature: true
  }
}
