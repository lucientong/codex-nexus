/**
 * 书房状态管理
 */
import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Library, LibraryListItem, LibraryStats, CreateLibraryParams, UpdateLibraryParams } from '../types'

interface LibraryState {
  // 书房列表
  libraries: LibraryListItem[]
  // 当前选中的书房
  currentLibrary: Library | null
  // 当前书房统计
  currentStats: LibraryStats | null
  // 分页信息
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
  // 加载状态
  loading: boolean
  // 刷新状态
  refreshing: boolean
  // 错误信息
  error: string | null
  
  // Actions
  fetchLibraries: (refresh?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  fetchLibrary: (libraryId: string) => Promise<void>
  fetchLibraryStats: (libraryId: string) => Promise<void>
  createLibrary: (params: CreateLibraryParams) => Promise<Library | null>
  updateLibrary: (libraryId: string, params: UpdateLibraryParams) => Promise<void>
  deleteLibrary: (libraryId: string) => Promise<boolean>
  setCurrentLibrary: (library: Library | null) => void
  clearError: () => void
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  libraries: [],
  currentLibrary: null,
  currentStats: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false
  },
  loading: false,
  refreshing: false,
  error: null,
  
  fetchLibraries: async (refresh = false) => {
    const { pagination } = get()
    
    if (refresh) {
      set({ refreshing: true })
    } else {
      set({ loading: true })
    }
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'library-service',
        data: {
          action: 'list',
          page: refresh ? 1 : pagination.page,
          pageSize: pagination.pageSize
        }
      })
      
      const res = result.result as {
        success: boolean
        data?: {
          list: LibraryListItem[]
          total: number
          page: number
          pageSize: number
          hasMore: boolean
        }
        error?: { message: string }
      }
      
      if (res.success && res.data) {
        set({
          libraries: refresh ? res.data.list : [...get().libraries, ...res.data.list],
          pagination: {
            page: res.data.page,
            pageSize: res.data.pageSize,
            total: res.data.total,
            hasMore: res.data.hasMore
          },
          loading: false,
          refreshing: false,
          error: null
        })
      } else {
        set({
          error: res.error?.message || '获取书房列表失败',
          loading: false,
          refreshing: false
        })
      }
    } catch (err) {
      console.error('Fetch libraries error:', err)
      set({ error: '网络错误，请重试', loading: false, refreshing: false })
    }
  },
  
  loadMore: async () => {
    const { pagination, loading } = get()
    
    if (loading || !pagination.hasMore) return
    
    set({ pagination: { ...pagination, page: pagination.page + 1 } })
    await get().fetchLibraries()
  },
  
  fetchLibrary: async (libraryId) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'library-service',
        data: { action: 'get', libraryId }
      })
      
      const res = result.result as { success: boolean; data?: Library; error?: { message: string } }
      
      if (res.success && res.data) {
        set({ currentLibrary: res.data, loading: false })
      } else {
        set({ error: res.error?.message || '获取书房详情失败', loading: false })
      }
    } catch (err) {
      console.error('Fetch library error:', err)
      set({ error: '网络错误，请重试', loading: false })
    }
  },
  
  fetchLibraryStats: async (libraryId) => {
    try {
      const result = await Taro.cloud.callFunction({
        name: 'library-service',
        data: { action: 'stats', libraryId }
      })
      
      const res = result.result as { success: boolean; data?: LibraryStats }
      
      if (res.success && res.data) {
        set({ currentStats: res.data })
      }
    } catch (err) {
      console.error('Fetch library stats error:', err)
    }
  },
  
  createLibrary: async (params) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'library-service',
        data: { action: 'create', ...params }
      })
      
      const res = result.result as { success: boolean; data?: Library; error?: { message: string } }
      
      if (res.success && res.data) {
        // 刷新列表
        await get().fetchLibraries(true)
        set({ loading: false })
        return res.data
      } else {
        set({ error: res.error?.message || '创建书房失败', loading: false })
        return null
      }
    } catch (err) {
      console.error('Create library error:', err)
      set({ error: '网络错误，请重试', loading: false })
      return null
    }
  },
  
  updateLibrary: async (libraryId, params) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'library-service',
        data: { action: 'update', libraryId, ...params }
      })
      
      const res = result.result as { success: boolean; data?: Library; error?: { message: string } }
      
      if (res.success && res.data) {
        const { currentLibrary, libraries } = get()
        
        if (currentLibrary?._id === libraryId) {
          set({ currentLibrary: { ...currentLibrary, ...res.data } })
        }
        
        // 更新列表中的项
        set({
          libraries: libraries.map(lib =>
            lib._id === libraryId ? { ...lib, ...res.data } : lib
          ),
          loading: false
        })
      } else {
        set({ error: res.error?.message || '更新书房失败', loading: false })
      }
    } catch (err) {
      console.error('Update library error:', err)
      set({ error: '网络错误，请重试', loading: false })
    }
  },
  
  deleteLibrary: async (libraryId) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'library-service',
        data: { action: 'delete', libraryId }
      })
      
      const res = result.result as { success: boolean; error?: { message: string } }
      
      if (res.success) {
        const { libraries, currentLibrary } = get()
        
        set({
          libraries: libraries.filter(lib => lib._id !== libraryId),
          currentLibrary: currentLibrary?._id === libraryId ? null : currentLibrary,
          loading: false
        })
        
        return true
      } else {
        set({ error: res.error?.message || '删除书房失败', loading: false })
        return false
      }
    } catch (err) {
      console.error('Delete library error:', err)
      set({ error: '网络错误，请重试', loading: false })
      return false
    }
  },
  
  setCurrentLibrary: (library) => set({ currentLibrary: library }),
  
  clearError: () => set({ error: null })
}))
