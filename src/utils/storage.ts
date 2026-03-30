/**
 * 本地存储工具函数
 */
import Taro from '@tarojs/taro'

const STORAGE_PREFIX = 'codex_nexus_'

/**
 * 存储数据
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    Taro.setStorageSync(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch (err) {
    console.error('Set storage error:', err)
  }
}

/**
 * 获取数据
 */
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const value = Taro.getStorageSync(`${STORAGE_PREFIX}${key}`)
    if (value) {
      return JSON.parse(value) as T
    }
    return defaultValue
  } catch (err) {
    console.error('Get storage error:', err)
    return defaultValue
  }
}

/**
 * 删除数据
 */
export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(`${STORAGE_PREFIX}${key}`)
  } catch (err) {
    console.error('Remove storage error:', err)
  }
}

/**
 * 清空所有数据
 */
export function clearStorage(): void {
  try {
    const info = Taro.getStorageInfoSync()
    info.keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        Taro.removeStorageSync(key)
      }
    })
  } catch (err) {
    console.error('Clear storage error:', err)
  }
}

// 常用存储键
export const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  LAST_LIBRARY_ID: 'last_library_id',
  VIEW_MODE: 'view_mode',
  SORT_CONFIG: 'sort_config',
  SCAN_HISTORY: 'scan_history'
}

/**
 * 获取扫码历史
 */
export function getScanHistory(): string[] {
  return getStorage<string[]>(STORAGE_KEYS.SCAN_HISTORY, []) || []
}

/**
 * 添加到扫码历史
 */
export function addToScanHistory(code: string): void {
  const history = getScanHistory()
  
  // 去重
  const index = history.indexOf(code)
  if (index > -1) {
    history.splice(index, 1)
  }
  
  // 添加到开头
  history.unshift(code)
  
  // 最多保留 50 条
  if (history.length > 50) {
    history.pop()
  }
  
  setStorage(STORAGE_KEYS.SCAN_HISTORY, history)
}
