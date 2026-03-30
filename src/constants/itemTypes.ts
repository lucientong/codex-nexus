/**
 * 藏品类型常量
 */
import type { ItemType } from '../types'

// 藏品类型列表
export const ITEM_TYPES: Array<{
  value: ItemType
  label: string
  icon: string
  color: string
  description: string
}> = [
  {
    value: 'book',
    label: '图书',
    icon: 'book',
    color: '#8B4513',
    description: '书籍、小说、教材等'
  },
  {
    value: 'cd',
    label: 'CD',
    icon: 'disc',
    color: '#1890FF',
    description: 'CD 唱片'
  },
  {
    value: 'vinyl',
    label: '黑胶',
    icon: 'vinyl',
    color: '#2D2D2D',
    description: '黑胶唱片、LP、EP'
  },
  {
    value: 'dvd',
    label: 'DVD',
    icon: 'film',
    color: '#FF4D4F',
    description: 'DVD、蓝光光盘'
  },
  {
    value: 'magazine',
    label: '杂志',
    icon: 'newspaper',
    color: '#52C41A',
    description: '杂志、期刊'
  }
]

// 藏品类型 Map
export const ITEM_TYPE_MAP = new Map(
  ITEM_TYPES.map(type => [type.value, type])
)

// 获取类型标签
export function getItemTypeLabel(type: ItemType): string {
  return ITEM_TYPE_MAP.get(type)?.label || type
}

// 获取类型颜色
export function getItemTypeColor(type: ItemType): string {
  return ITEM_TYPE_MAP.get(type)?.color || '#999999'
}

// 藏品状态列表
export const ITEM_STATUS_LIST = [
  { value: 'in_library', label: '在库', color: '#52C41A' },
  { value: 'lent', label: '借出', color: '#FAAD14' },
  { value: 'given_away', label: '已送出', color: '#999999' }
]

// 货币列表
export const CURRENCY_LIST = [
  { value: 'CNY', label: '人民币', symbol: '¥' },
  { value: 'USD', label: '美元', symbol: '$' },
  { value: 'EUR', label: '欧元', symbol: '€' },
  { value: 'JPY', label: '日元', symbol: '¥' },
  { value: 'GBP', label: '英镑', symbol: '£' }
]
