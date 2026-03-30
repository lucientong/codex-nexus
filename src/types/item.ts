/**
 * 藏品类型定义
 */

// 藏品类型枚举
export type ItemType = 'book' | 'cd' | 'vinyl' | 'dvd' | 'magazine'

// 藏品状态
export type ItemStatus = 'in_library' | 'lent' | 'given_away'

// 货币类型
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'GBP'

// 基础藏品信息
export interface BaseItem {
  _id: string
  // 所属书房 ID
  libraryId: string
  // 所属用户 ID
  userId: string
  // 藏品类型
  type: ItemType
  // 标题
  title: string
  // 副标题
  subtitle?: string
  // 封面图 URL
  coverUrl?: string
  // 购买价格
  purchasePrice?: number
  // 货币类型
  currency: Currency
  // 购买日期
  purchaseDate?: Date
  // 备注
  notes?: string
  // 状态
  status: ItemStatus
  // 创建时间
  createdAt: Date
  // 更新时间
  updatedAt: Date
}

// 图书额外字段
export interface BookExtraFields {
  // 作者列表
  authors: string[]
  // 出版社
  publisher?: string
  // 出版日期
  publishDate?: string
  // ISBN
  isbn?: string
  // 页数
  pages?: number
  // 语言
  language?: string
  // 系列丛书
  series?: string
  // 版次
  edition?: string
}

// CD/黑胶额外字段
export interface MusicExtraFields {
  // 艺术家
  artist: string
  // 厂牌
  label?: string
  // 发行日期
  releaseDate?: string
  // 条形码
  barcode?: string
  // 音乐流派
  genre?: string[]
  // 介质格式（CD / LP / EP / Single 等）
  format?: string
  // 曲目数
  trackCount?: number
  // 碟片数
  discCount?: number
  // 目录编号
  catalogNumber?: string
}

// DVD 额外字段
export interface DVDExtraFields {
  // 导演
  director?: string
  // 演员
  actors?: string[]
  // 发行日期
  releaseDate?: string
  // 条形码
  barcode?: string
  // 时长（分钟）
  duration?: number
  // 区域码
  region?: string
  // 音轨
  audioTracks?: string[]
  // 字幕
  subtitles?: string[]
}

// 杂志额外字段
export interface MagazineExtraFields {
  // 出版社
  publisher?: string
  // ISSN
  issn?: string
  // 期号
  issue?: string
  // 出版日期
  publishDate?: string
  // 语言
  language?: string
}

// 图书
export interface BookItem extends BaseItem {
  type: 'book'
  extraFields: BookExtraFields
}

// CD
export interface CDItem extends BaseItem {
  type: 'cd'
  extraFields: MusicExtraFields
}

// 黑胶唱片
export interface VinylItem extends BaseItem {
  type: 'vinyl'
  extraFields: MusicExtraFields
}

// DVD
export interface DVDItem extends BaseItem {
  type: 'dvd'
  extraFields: DVDExtraFields
}

// 杂志
export interface MagazineItem extends BaseItem {
  type: 'magazine'
  extraFields: MagazineExtraFields
}

// 藏品联合类型
export type Item = BookItem | CDItem | VinylItem | DVDItem | MagazineItem

// 藏品额外字段联合类型
export type ItemExtraFields = BookExtraFields | MusicExtraFields | DVDExtraFields | MagazineExtraFields

// 创建藏品参数
export interface CreateItemParams {
  libraryId: string
  type: ItemType
  title: string
  subtitle?: string
  coverUrl?: string
  purchasePrice?: number
  currency?: Currency
  purchaseDate?: Date
  notes?: string
  extraFields: ItemExtraFields
}

// 更新藏品参数
export interface UpdateItemParams {
  title?: string
  subtitle?: string
  coverUrl?: string
  purchasePrice?: number
  currency?: Currency
  purchaseDate?: Date
  notes?: string
  status?: ItemStatus
  extraFields?: Partial<ItemExtraFields>
}

// 藏品搜索参数
export interface SearchItemParams {
  libraryId?: string
  type?: ItemType
  keyword?: string
  status?: ItemStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

// 藏品列表项（用于列表展示）
export interface ItemListItem {
  _id: string
  type: ItemType
  title: string
  subtitle?: string
  coverUrl?: string
  // 作者/艺术家（根据类型显示）
  creator?: string
  // 出版社/厂牌
  publisher?: string
  // 出版/发行日期
  date?: string
  purchasePrice?: number
  currency: Currency
  status: ItemStatus
}

// 藏品类型配置
export const ITEM_TYPE_CONFIG: Record<ItemType, {
  label: string
  icon: string
  color: string
}> = {
  book: {
    label: '图书',
    icon: 'book',
    color: '#8B4513'
  },
  cd: {
    label: 'CD',
    icon: 'disc',
    color: '#1890FF'
  },
  vinyl: {
    label: '黑胶',
    icon: 'vinyl',
    color: '#2D2D2D'
  },
  dvd: {
    label: 'DVD',
    icon: 'film',
    color: '#FF4D4F'
  },
  magazine: {
    label: '杂志',
    icon: 'newspaper',
    color: '#52C41A'
  }
}

// 默认货币
export const DEFAULT_CURRENCY: Currency = 'CNY'

// 货币符号映射
export const CURRENCY_SYMBOL: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£'
}
