/**
 * 云开发服务封装
 */
import Taro from '@tarojs/taro'
import type { ApiResponse } from '../types'

// 云开发环境配置（从环境变量读取）
// 在 .env.development 或 .env.production 中配置 TARO_APP_CLOUD_ENV
export const CLOUD_ENV = process.env.TARO_APP_CLOUD_ENV || ''

// 验证环境配置
if (!CLOUD_ENV) {
  console.warn('[CloudBase] 警告：未配置云开发环境 ID，请在 .env 文件中设置 TARO_APP_CLOUD_ENV')
}

// 是否已初始化
let isInitialized = false

/**
 * 初始化云开发
 */
export function initCloud() {
  if (isInitialized) return
  
  Taro.cloud?.init({
    env: CLOUD_ENV,
    traceUser: true
  })
  
  isInitialized = true
}

/**
 * 调用云函数（带错误处理）
 */
export async function callCloudFunction<T = unknown>(
  name: string,
  data: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const result = await Taro.cloud.callFunction({
      name,
      data
    })
    
    return result.result as ApiResponse<T>
  } catch (err) {
    console.error(`Cloud function ${name} error:`, err)
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '网络错误，请检查网络连接后重试'
      }
    }
  }
}

/**
 * 上传文件到云存储
 */
export async function uploadFile(
  filePath: string,
  cloudPath: string
): Promise<{ success: boolean; fileID?: string; error?: string }> {
  try {
    const result = await Taro.cloud.uploadFile({
      filePath,
      cloudPath
    })
    
    return {
      success: true,
      fileID: result.fileID
    }
  } catch (err) {
    console.error('Upload file error:', err)
    return {
      success: false,
      error: '文件上传失败'
    }
  }
}

/**
 * 获取临时文件链接
 */
export async function getTempFileURL(
  fileID: string
): Promise<{ success: boolean; tempFileURL?: string; error?: string }> {
  try {
    const result = await Taro.cloud.getTempFileURL({
      fileList: [fileID]
    })
    
    if (result.fileList[0].status === 0) {
      return {
        success: true,
        tempFileURL: result.fileList[0].tempFileURL
      }
    }
    
    return {
      success: false,
      error: '获取文件链接失败'
    }
  } catch (err) {
    console.error('Get temp file URL error:', err)
    return {
      success: false,
      error: '获取文件链接失败'
    }
  }
}

/**
 * 删除云存储文件
 */
export async function deleteFile(
  fileID: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await Taro.cloud.deleteFile({
      fileList: [fileID]
    })
    
    return { success: true }
  } catch (err) {
    console.error('Delete file error:', err)
    return {
      success: false,
      error: '文件删除失败'
    }
  }
}
