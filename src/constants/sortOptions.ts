/**
 * 排序选项常量
 */
import type { SortField, SortOrder } from '../types'

// 排序字段列表
export const SORT_FIELDS: Array<{
  value: SortField
  label: string
}> = [
  { value: 'createdAt', label: '添加时间' },
  { value: 'title', label: '标题' },
  { value: 'author', label: '作者/艺术家' },
  { value: 'publishDate', label: '出版日期' },
  { value: 'purchasePrice', label: '购买价格' }
]

// 排序方向列表
export const SORT_ORDERS: Array<{
  value: SortOrder
  label: string
}> = [
  { value: 'desc', label: '降序' },
  { value: 'asc', label: '升序' }
]

// 快捷排序选项（组合字段和方向）
export const QUICK_SORT_OPTIONS = [
  { field: 'createdAt', order: 'desc' as SortOrder, label: '最近添加' },
  { field: 'createdAt', order: 'asc' as SortOrder, label: '最早添加' },
  { field: 'title', order: 'asc' as SortOrder, label: '标题 A-Z' },
  { field: 'title', order: 'desc' as SortOrder, label: '标题 Z-A' },
  { field: 'purchasePrice', order: 'desc' as SortOrder, label: '价格从高到低' },
  { field: 'purchasePrice', order: 'asc' as SortOrder, label: '价格从低到高' }
]

// 获取排序字段标签
export function getSortFieldLabel(field: SortField): string {
  const found = SORT_FIELDS.find(f => f.value === field)
  return found?.label || field
}
