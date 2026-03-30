/**
 * 书房服务
 */
import { callCloudFunction } from './cloud'
import type {
  Library,
  LibraryListItem,
  LibraryStats,
  CreateLibraryParams,
  UpdateLibraryParams,
  ApiResponse,
  PaginatedData
} from '../types'

const FUNCTION_NAME = 'library-service'

/**
 * 创建书房
 */
export async function createLibrary(
  params: CreateLibraryParams
): Promise<ApiResponse<Library>> {
  return callCloudFunction<Library>(FUNCTION_NAME, {
    action: 'create',
    ...params
  })
}

/**
 * 获取书房列表
 */
export async function getLibraries(params?: {
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<LibraryListItem>>> {
  return callCloudFunction<PaginatedData<LibraryListItem>>(FUNCTION_NAME, {
    action: 'list',
    ...params
  })
}

/**
 * 获取书房详情
 */
export async function getLibrary(
  libraryId: string
): Promise<ApiResponse<Library>> {
  return callCloudFunction<Library>(FUNCTION_NAME, {
    action: 'get',
    libraryId
  })
}

/**
 * 更新书房
 */
export async function updateLibrary(
  libraryId: string,
  params: UpdateLibraryParams
): Promise<ApiResponse<Library>> {
  return callCloudFunction<Library>(FUNCTION_NAME, {
    action: 'update',
    libraryId,
    ...params
  })
}

/**
 * 删除书房
 */
export async function deleteLibrary(
  libraryId: string
): Promise<ApiResponse<void>> {
  return callCloudFunction<void>(FUNCTION_NAME, {
    action: 'delete',
    libraryId
  })
}

/**
 * 获取书房统计
 */
export async function getLibraryStats(
  libraryId: string
): Promise<ApiResponse<LibraryStats>> {
  return callCloudFunction<LibraryStats>(FUNCTION_NAME, {
    action: 'stats',
    libraryId
  })
}
