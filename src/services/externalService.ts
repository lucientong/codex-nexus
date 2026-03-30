/**
 * 外部数据源服务
 */
import { callCloudFunction } from './cloud'
import type { ExternalBookResult, ExternalMusicResult, ApiResponse, ItemType } from '../types'

const FUNCTION_NAME = 'external-api'

/**
 * 通过 ISBN 搜索图书
 */
export async function searchBookByISBN(
  isbn: string
): Promise<ApiResponse<ExternalBookResult & { source: string }>> {
  return callCloudFunction(FUNCTION_NAME, {
    action: 'searchBookByISBN',
    isbn
  })
}

/**
 * 通过关键词搜索图书
 */
export async function searchBookByKeyword(
  keyword: string,
  limit = 10
): Promise<ApiResponse<(ExternalBookResult & { source: string })[]>> {
  return callCloudFunction(FUNCTION_NAME, {
    action: 'searchBookByKeyword',
    keyword,
    limit
  })
}

/**
 * 搜索图书（支持多种搜索方式）
 */
export async function searchBooks(
  params: { title?: string; author?: string; isbn?: string },
  limit = 10
): Promise<ApiResponse<(ExternalBookResult & { source: string })[]>> {
  // 如果是 ISBN 搜索，使用专门的方法
  if (params.isbn) {
    const result = await searchBookByISBN(params.isbn)
    if (result.success && result.data) {
      return { success: true, data: [result.data] }
    }
    return { success: false, error: result.error }
  }
  
  // 其他搜索走关键词搜索
  const keyword = params.title || params.author || ''
  return callCloudFunction(FUNCTION_NAME, {
    action: 'searchBooks',
    ...params,
    keyword,
    limit
  })
}

/**
 * 通过条形码搜索音乐
 */
export async function searchMusicByBarcode(
  barcode: string
): Promise<ApiResponse<ExternalMusicResult & { source: string }>> {
  return callCloudFunction(FUNCTION_NAME, {
    action: 'searchMusicByBarcode',
    barcode
  })
}

/**
 * 通过关键词搜索音乐
 */
export async function searchMusicByKeyword(
  keyword: string,
  limit = 10
): Promise<ApiResponse<(ExternalMusicResult & { source: string })[]>> {
  return callCloudFunction(FUNCTION_NAME, {
    action: 'searchMusicByKeyword',
    keyword,
    limit
  })
}

/**
 * 搜索音乐（支持多种类型）
 */
export async function searchMusic(
  params: { query: string; type?: ItemType },
  limit = 10
): Promise<ApiResponse<(ExternalMusicResult & { source: string })[]>> {
  return callCloudFunction(FUNCTION_NAME, {
    action: 'searchMusic',
    ...params,
    limit
  })
}
