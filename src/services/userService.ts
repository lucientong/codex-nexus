/**
 * 用户服务
 */
import { callCloudFunction } from './cloud'
import type { User, UpdateUserParams, ApiResponse } from '../types'

const FUNCTION_NAME = 'user-service'

/**
 * 用户登录
 */
export async function login(params?: {
  nickname?: string
  avatarUrl?: string
}): Promise<ApiResponse<User>> {
  return callCloudFunction<User>(FUNCTION_NAME, {
    action: 'login',
    ...params
  })
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<ApiResponse<User>> {
  return callCloudFunction<User>(FUNCTION_NAME, {
    action: 'getUserInfo'
  })
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(
  params: UpdateUserParams
): Promise<ApiResponse<User>> {
  return callCloudFunction<User>(FUNCTION_NAME, {
    action: 'updateUserInfo',
    ...params
  })
}

/**
 * 刷新用户统计
 */
export async function updateUserStats(): Promise<ApiResponse<{
  libraryCount: number
  itemCount: number
  totalValue: number
}>> {
  return callCloudFunction(FUNCTION_NAME, {
    action: 'updateUserStats'
  })
}
