/**
 * 藏品服务
 */
import { callCloudFunction } from './cloud'
import type {
  Item,
  ItemType,
  CreateItemParams,
  UpdateItemParams,
  SearchItemParams,
  DuplicateCheckResult,
  ApiResponse,
  PaginatedData
} from '../types'

const FUNCTION_NAME = 'item-service'

/**
 * 创建藏品
 */
export async function createItem(
  params: CreateItemParams
): Promise<ApiResponse<Item>> {
  return callCloudFunction<Item>(FUNCTION_NAME, {
    action: 'create',
    ...params
  })
}

/**
 * 获取藏品列表
 */
export async function getItems(
  params?: SearchItemParams
): Promise<ApiResponse<PaginatedData<Item>>> {
  return callCloudFunction<PaginatedData<Item>>(FUNCTION_NAME, {
    action: 'list',
    ...params
  })
}

/**
 * 获取藏品详情
 */
export async function getItem(itemId: string): Promise<ApiResponse<Item>> {
  return callCloudFunction<Item>(FUNCTION_NAME, {
    action: 'get',
    itemId
  })
}

/**
 * 更新藏品
 */
export async function updateItem(
  itemId: string,
  params: UpdateItemParams
): Promise<ApiResponse<Item>> {
  return callCloudFunction<Item>(FUNCTION_NAME, {
    action: 'update',
    itemId,
    ...params
  })
}

/**
 * 删除藏品
 */
export async function deleteItem(itemId: string): Promise<ApiResponse<void>> {
  return callCloudFunction<void>(FUNCTION_NAME, {
    action: 'delete',
    itemId
  })
}

/**
 * 去重检测
 */
export async function checkDuplicate(params: {
  type?: ItemType
  isbn?: string
  barcode?: string
  title?: string
}): Promise<ApiResponse<DuplicateCheckResult>> {
  return callCloudFunction<DuplicateCheckResult>(FUNCTION_NAME, {
    action: 'checkDuplicate',
    ...params
  })
}

/**
 * 批量创建藏品
 */
export async function batchCreateItems(
  items: CreateItemParams[]
): Promise<ApiResponse<{ created: number; results: Array<{ _id: string; title: string; success: boolean }> }>> {
  return callCloudFunction(FUNCTION_NAME, {
    action: 'batchCreate',
    items
  })
}
