/**
 * API 响应类型定义
 */

// 通用 API 响应
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// 分页数据
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {}

// 云函数调用参数基类
export interface CloudFunctionParams {
  action: string
  [key: string]: unknown
}

// 外部数据源搜索结果 - 图书
export interface ExternalBookResult {
  title: string
  subtitle?: string
  authors: string[]
  publisher?: string
  publishDate?: string
  isbn?: string
  coverUrl?: string
  pages?: number
  language?: string
  description?: string
  source: 'openlibrary' | 'googlebooks' | 'douban'
}

// 外部数据源搜索结果 - 音乐
export interface ExternalMusicResult {
  title: string
  artist: string
  label?: string
  releaseDate?: string
  barcode?: string
  coverUrl?: string
  genre?: string[]
  format?: string
  trackCount?: number
  discCount?: number
  catalogNumber?: string
  source: 'discogs' | 'musicbrainz'
}

// 外部数据源搜索响应
export interface ExternalSearchResponse {
  book?: ExternalBookResult[]
  music?: ExternalMusicResult[]
}

// 扫码结果
export interface ScanResult {
  type: 'ISBN' | 'EAN' | 'UPC' | 'UNKNOWN'
  code: string
  rawData?: string
}

// 统计数据
export interface StatisticsData {
  // 总览
  overview: {
    totalItems: number
    totalValue: number
    totalLibraries: number
    monthlyAdded: number
  }
  // 类型分布
  typeDistribution: Array<{
    type: string
    count: number
    percentage: number
  }>
  // 月度趋势
  monthlyTrend: Array<{
    month: string
    count: number
    value: number
  }>
  // 作者/艺术家 TOP10
  topCreators: Array<{
    name: string
    count: number
  }>
  // 出版社/厂牌 TOP10
  topPublishers: Array<{
    name: string
    count: number
  }>
  // 年份分布
  yearDistribution: Array<{
    year: string
    count: number
  }>
}

// 去重检测结果
export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingItem?: {
    _id: string
    title: string
    libraryId: string
    libraryName: string
  }
}
