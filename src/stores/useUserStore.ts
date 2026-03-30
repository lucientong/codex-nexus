/**
 * 用户状态管理
 */
import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { User, UserSettings, UpdateUserParams } from '../types'

interface UserState {
  // 用户信息
  user: User | null
  // 是否已登录
  isLoggedIn: boolean
  // 加载状态
  loading: boolean
  // 错误信息
  error: string | null
  
  // Actions
  login: () => Promise<void>
  logout: () => void
  updateUser: (params: UpdateUserParams) => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  refreshStats: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  
  login: async () => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'user-service',
        data: { action: 'login' }
      })
      
      const res = result.result as { success: boolean; data?: User; error?: { message: string } }
      
      if (res.success && res.data) {
        set({ user: res.data, isLoggedIn: true, loading: false })
      } else {
        set({ error: res.error?.message || '登录失败', loading: false })
      }
    } catch (err) {
      console.error('Login error:', err)
      set({ error: '网络错误，请重试', loading: false })
    }
  },
  
  logout: () => {
    set({ user: null, isLoggedIn: false })
  },
  
  updateUser: async (params) => {
    const { user } = get()
    if (!user) return
    
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'user-service',
        data: { action: 'updateUserInfo', ...params }
      })
      
      const res = result.result as { success: boolean; data?: User; error?: { message: string } }
      
      if (res.success && res.data) {
        set({ user: { ...user, ...res.data }, loading: false })
      } else {
        set({ error: res.error?.message || '更新失败', loading: false })
      }
    } catch (err) {
      console.error('Update user error:', err)
      set({ error: '网络错误，请重试', loading: false })
    }
  },
  
  updateSettings: async (settings) => {
    const { user } = get()
    if (!user) return
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'user-service',
        data: { action: 'updateUserInfo', settings }
      })
      
      const res = result.result as { success: boolean; data?: User }
      
      if (res.success && res.data) {
        set({ user: { ...user, settings: { ...user.settings, ...settings } } })
      }
    } catch (err) {
      console.error('Update settings error:', err)
    }
  },
  
  refreshStats: async () => {
    try {
      const result = await Taro.cloud.callFunction({
        name: 'user-service',
        data: { action: 'updateUserStats' }
      })
      
      const res = result.result as { success: boolean; data?: { libraryCount: number; itemCount: number; totalValue: number } }
      
      if (res.success && res.data) {
        const { user } = get()
        if (user) {
          set({ user: { ...user, stats: res.data } })
        }
      }
    } catch (err) {
      console.error('Refresh stats error:', err)
    }
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))
