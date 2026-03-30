/**
 * 书房类型定义
 */

// 排序字段
export type SortField = 'title' | 'author' | 'publishDate' | 'createdAt' | 'purchasePrice'

// 排序方向
export type SortOrder = 'asc' | 'desc'

// 书房信息
export interface Library {
  _id: string
  // 所属用户 ID
  userId: string
  // 书房名称
  name: string
  // 书房描述
  description?: string
  // 封面图 URL（可以是拼接的藏品封面）
  coverUrl?: string
  // 藏品数量
  itemCount: number
  // 默认排序字段
  sortBy: SortField
  // 默认排序方向
  sortOrder: SortOrder
  // 创建时间
  createdAt: Date
  // 更新时间
  updatedAt: Date
}

// 创建书房参数
export interface CreateLibraryParams {
  name: string
  description?: string
  coverUrl?: string
}

// 更新书房参数
export interface UpdateLibraryParams {
  name?: string
  description?: string
  coverUrl?: string
  sortBy?: SortField
  sortOrder?: SortOrder
}

// 书房列表项（用于首页展示）
export interface LibraryListItem extends Library {
  // 预览封面列表（最多 4 个藏品封面）
  previewCovers: string[]
}

// 书房统计信息
export interface LibraryStats {
  // 各类型藏品数量
  typeCount: {
    book: number
    cd: number
    vinyl: number
    dvd: number
    magazine: number
  }
  // 总价值
  totalValue: number
  // 本月新增
  monthlyAdded: number
}
