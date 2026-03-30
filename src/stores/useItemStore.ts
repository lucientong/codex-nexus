/**
 * 藏品状态管理
 */
import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type {
  Item,
  ItemType,
  ItemStatus,
  CreateItemParams,
  UpdateItemParams,
  SearchItemParams,
  DuplicateCheckResult
} from '../types'

interface ItemState {
  // 藏品列表
  items: Item[]
  // 当前选中的藏品
  currentItem: Item | null
  // 搜索/筛选参数
  searchParams: SearchItemParams
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
  fetchItems: (refresh?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  fetchItem: (itemId: string) => Promise<void>
  createItem: (params: CreateItemParams) => Promise<Item | null>
  updateItem: (itemId: string, params: UpdateItemParams) => Promise<void>
  deleteItem: (itemId: string) => Promise<boolean>
  checkDuplicate: (params: { type?: ItemType; isbn?: string; barcode?: string; title?: string }) => Promise<DuplicateCheckResult>
  setSearchParams: (params: Partial<SearchItemParams>) => void
  setCurrentItem: (item: Item | null) => void
  clearItems: () => void
  clearError: () => void
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  currentItem: null,
  searchParams: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false
  },
  loading: false,
  refreshing: false,
  error: null,
  
  fetchItems: async (refresh = false) => {
    const { searchParams, pagination } = get()
    
    if (refresh) {
      set({ refreshing: true })
    } else {
      set({ loading: true })
    }
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'item-service',
        data: {
          action: 'list',
          ...searchParams,
          page: refresh ? 1 : pagination.page
        }
      })
      
      const res = result.result as {
        success: boolean
        data?: {
          list: Item[]
          total: number
          page: number
          pageSize: number
          hasMore: boolean
        }
        error?: { message: string }
      }
      
      if (res.success && res.data) {
        set({
          items: refresh ? res.data.list : [...get().items, ...res.data.list],
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
          error: res.error?.message || '获取藏品列表失败',
          loading: false,
          refreshing: false
        })
      }
    } catch (err) {
      console.error('Fetch items error:', err)
      set({ error: '网络错误，请重试', loading: false, refreshing: false })
    }
  },
  
  loadMore: async () => {
    const { pagination, loading } = get()
    
    if (loading || !pagination.hasMore) return
    
    set({ pagination: { ...pagination, page: pagination.page + 1 } })
    await get().fetchItems()
  },
  
  fetchItem: async (itemId) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'item-service',
        data: { action: 'get', itemId }
      })
      
      const res = result.result as { success: boolean; data?: Item; error?: { message: string } }
      
      if (res.success && res.data) {
        set({ currentItem: res.data, loading: false })
      } else {
        set({ error: res.error?.message || '获取藏品详情失败', loading: false })
      }
    } catch (err) {
      console.error('Fetch item error:', err)
      set({ error: '网络错误，请重试', loading: false })
    }
  },
  
  createItem: async (params) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'item-service',
        data: { action: 'create', ...params }
      })
      
      const res = result.result as { success: boolean; data?: Item; error?: { message: string } }
      
      if (res.success && res.data) {
        // 添加到列表开头
        const { items } = get()
        set({
          items: [res.data, ...items],
          loading: false
        })
        return res.data
      } else {
        set({ error: res.error?.message || '创建藏品失败', loading: false })
        return null
      }
    } catch (err) {
      console.error('Create item error:', err)
      set({ error: '网络错误，请重试', loading: false })
      return null
    }
  },
  
  updateItem: async (itemId, params) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'item-service',
        data: { action: 'update', itemId, ...params }
      })
      
      const res = result.result as { success: boolean; data?: Item; error?: { message: string } }
      
      if (res.success && res.data) {
        const { currentItem, items } = get()
        
        if (currentItem?._id === itemId) {
          set({ currentItem: { ...currentItem, ...res.data } as Item })
        }
        
        // 更新列表中的项
        set({
          items: items.map(item =>
            item._id === itemId ? { ...item, ...res.data } as Item : item
          ),
          loading: false
        })
      } else {
        set({ error: res.error?.message || '更新藏品失败', loading: false })
      }
    } catch (err) {
      console.error('Update item error:', err)
      set({ error: '网络错误，请重试', loading: false })
    }
  },
  
  deleteItem: async (itemId) => {
    set({ loading: true, error: null })
    
    try {
      const result = await Taro.cloud.callFunction({
        name: 'item-service',
        data: { action: 'delete', itemId }
      })
      
      const res = result.result as { success: boolean; error?: { message: string } }
      
      if (res.success) {
        const { items, currentItem } = get()
        
        set({
          items: items.filter(item => item._id !== itemId),
          currentItem: currentItem?._id === itemId ? null : currentItem,
          loading: false
        })
        
        return true
      } else {
        set({ error: res.error?.message || '删除藏品失败', loading: false })
        return false
      }
    } catch (err) {
      console.error('Delete item error:', err)
      set({ error: '网络错误，请重试', loading: false })
      return false
    }
  },
  
  checkDuplicate: async (params) => {
    try {
      const result = await Taro.cloud.callFunction({
        name: 'item-service',
        data: { action: 'checkDuplicate', ...params }
      })
      
      const res = result.result as { success: boolean; data?: DuplicateCheckResult }
      
      if (res.success && res.data) {
        return res.data
      }
      
      return { isDuplicate: false }
    } catch (err) {
      console.error('Check duplicate error:', err)
      return { isDuplicate: false }
    }
  },
  
  setSearchParams: (params) => {
    const { searchParams } = get()
    set({
      searchParams: { ...searchParams, ...params },
      pagination: { ...get().pagination, page: 1 }
    })
  },
  
  setCurrentItem: (item) => set({ currentItem: item }),
  
  clearItems: () => set({
    items: [],
    pagination: { page: 1, pageSize: 20, total: 0, hasMore: false }
  }),
  
  clearError: () => set({ error: null })
}))
