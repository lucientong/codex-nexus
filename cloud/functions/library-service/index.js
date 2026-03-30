/**
 * 书房服务云函数
 * 处理书房的增删改查
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const librariesCollection = db.collection('libraries')
const itemsCollection = db.collection('items')

/**
 * 创建书房
 */
async function createLibrary(event, wxContext) {
  const { OPENID } = wxContext
  const { name, description, coverUrl } = event
  
  if (!name || !name.trim()) {
    return {
      success: false,
      error: {
        code: 'INVALID_NAME',
        message: '书房名称不能为空'
      }
    }
  }
  
  const newLibrary = {
    userId: OPENID,
    name: name.trim(),
    description: description || '',
    coverUrl: coverUrl || '',
    itemCount: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }
  
  const result = await librariesCollection.add({ data: newLibrary })
  
  return {
    success: true,
    data: {
      _id: result._id,
      ...newLibrary
    }
  }
}

/**
 * 获取用户的书房列表
 */
async function getLibraries(event, wxContext) {
  const { OPENID } = wxContext
  const { page = 1, pageSize = 20 } = event
  
  const skip = (page - 1) * pageSize
  
  // 获取总数
  const countResult = await librariesCollection
    .where({ userId: OPENID })
    .count()
  
  // 获取列表
  const listResult = await librariesCollection
    .where({ userId: OPENID })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()
  
  // 为每个书房获取预览封面
  const librariesWithPreviews = await Promise.all(
    listResult.data.map(async (library) => {
      const items = await itemsCollection
        .where({ libraryId: library._id })
        .field({ coverUrl: true })
        .orderBy('createdAt', 'desc')
        .limit(4)
        .get()
      
      return {
        ...library,
        previewCovers: items.data
          .map(item => item.coverUrl)
          .filter(Boolean)
      }
    })
  )
  
  return {
    success: true,
    data: {
      list: librariesWithPreviews,
      total: countResult.total,
      page,
      pageSize,
      hasMore: skip + listResult.data.length < countResult.total
    }
  }
}

/**
 * 获取书房详情
 */
async function getLibrary(event, wxContext) {
  const { OPENID } = wxContext
  const { libraryId } = event
  
  const result = await librariesCollection.doc(libraryId).get()
  
  if (!result.data) {
    return {
      success: false,
      error: {
        code: 'LIBRARY_NOT_FOUND',
        message: '书房不存在'
      }
    }
  }
  
  if (result.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权访问此书房'
      }
    }
  }
  
  return {
    success: true,
    data: result.data
  }
}

/**
 * 更新书房
 */
async function updateLibrary(event, wxContext) {
  const { OPENID } = wxContext
  const { libraryId, name, description, coverUrl, sortBy, sortOrder } = event
  
  // 检查权限
  const library = await librariesCollection.doc(libraryId).get()
  
  if (!library.data || library.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权修改此书房'
      }
    }
  }
  
  const updateData = {
    updatedAt: db.serverDate()
  }
  
  if (name !== undefined) updateData.name = name.trim()
  if (description !== undefined) updateData.description = description
  if (coverUrl !== undefined) updateData.coverUrl = coverUrl
  if (sortBy !== undefined) updateData.sortBy = sortBy
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder
  
  await librariesCollection.doc(libraryId).update({ data: updateData })
  
  return {
    success: true,
    data: {
      ...library.data,
      ...updateData
    }
  }
}

/**
 * 删除书房
 */
async function deleteLibrary(event, wxContext) {
  const { OPENID } = wxContext
  const { libraryId } = event
  
  // 检查权限
  const library = await librariesCollection.doc(libraryId).get()
  
  if (!library.data || library.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权删除此书房'
      }
    }
  }
  
  // 检查是否有藏品
  const itemCount = await itemsCollection
    .where({ libraryId })
    .count()
  
  if (itemCount.total > 0) {
    return {
      success: false,
      error: {
        code: 'LIBRARY_NOT_EMPTY',
        message: '书房内还有藏品，请先清空'
      }
    }
  }
  
  await librariesCollection.doc(libraryId).remove()
  
  return {
    success: true
  }
}

/**
 * 获取书房统计信息
 */
async function getLibraryStats(event, wxContext) {
  const { OPENID } = wxContext
  const { libraryId } = event
  
  // 检查权限
  const library = await librariesCollection.doc(libraryId).get()
  
  if (!library.data || library.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权访问此书房'
      }
    }
  }
  
  // 获取所有藏品
  const items = await itemsCollection
    .where({ libraryId })
    .field({ type: true, purchasePrice: true, createdAt: true })
    .get()
  
  // 统计各类型数量
  const typeCount = {
    book: 0,
    cd: 0,
    vinyl: 0,
    dvd: 0,
    magazine: 0
  }
  
  let totalValue = 0
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  let monthlyAdded = 0
  
  items.data.forEach(item => {
    if (typeCount[item.type] !== undefined) {
      typeCount[item.type]++
    }
    totalValue += item.purchasePrice || 0
    
    if (new Date(item.createdAt) >= monthStart) {
      monthlyAdded++
    }
  })
  
  return {
    success: true,
    data: {
      typeCount,
      totalValue,
      monthlyAdded
    }
  }
}

// 云函数入口
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action } = event
  
  switch (action) {
    case 'create':
      return createLibrary(event, wxContext)
    case 'list':
      return getLibraries(event, wxContext)
    case 'get':
      return getLibrary(event, wxContext)
    case 'update':
      return updateLibrary(event, wxContext)
    case 'delete':
      return deleteLibrary(event, wxContext)
    case 'stats':
      return getLibraryStats(event, wxContext)
    default:
      return {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: '无效的操作'
        }
      }
  }
}
