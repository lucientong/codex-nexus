/**
 * 藏品服务云函数
 * 处理藏品的增删改查、去重检测
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const itemsCollection = db.collection('items')
const librariesCollection = db.collection('libraries')

/**
 * 创建藏品
 */
async function createItem(event, wxContext) {
  const { OPENID } = wxContext
  const {
    libraryId,
    type,
    title,
    subtitle,
    coverUrl,
    purchasePrice,
    currency = 'CNY',
    purchaseDate,
    notes,
    extraFields
  } = event
  
  // 验证必填字段
  if (!libraryId || !type || !title) {
    return {
      success: false,
      error: {
        code: 'INVALID_PARAMS',
        message: '缺少必填字段'
      }
    }
  }
  
  // 验证书房权限
  const library = await librariesCollection.doc(libraryId).get()
  if (!library.data || library.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权在此书房添加藏品'
      }
    }
  }
  
  const newItem = {
    libraryId,
    userId: OPENID,
    type,
    title: title.trim(),
    subtitle: subtitle || '',
    coverUrl: coverUrl || '',
    purchasePrice: purchasePrice || null,
    currency,
    purchaseDate: purchaseDate || null,
    notes: notes || '',
    status: 'in_library',
    extraFields: extraFields || {},
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }
  
  const result = await itemsCollection.add({ data: newItem })
  
  // 更新书房的藏品数量
  await librariesCollection.doc(libraryId).update({
    data: {
      itemCount: _.inc(1),
      updatedAt: db.serverDate()
    }
  })
  
  return {
    success: true,
    data: {
      _id: result._id,
      ...newItem
    }
  }
}

/**
 * 获取藏品列表
 */
async function getItems(event, wxContext) {
  const { OPENID } = wxContext
  const {
    libraryId,
    type,
    keyword,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20
  } = event
  
  // 构建查询条件
  const where = { userId: OPENID }
  
  if (libraryId) {
    where.libraryId = libraryId
  }
  
  if (type) {
    where.type = type
  }
  
  if (status) {
    where.status = status
  }
  
  if (keyword) {
    where.title = db.RegExp({
      regexp: keyword,
      options: 'i'
    })
  }
  
  const skip = (page - 1) * pageSize
  
  // 获取总数
  const countResult = await itemsCollection.where(where).count()
  
  // 获取列表
  const listResult = await itemsCollection
    .where(where)
    .orderBy(sortBy, sortOrder)
    .skip(skip)
    .limit(pageSize)
    .get()
  
  return {
    success: true,
    data: {
      list: listResult.data,
      total: countResult.total,
      page,
      pageSize,
      hasMore: skip + listResult.data.length < countResult.total
    }
  }
}

/**
 * 获取藏品详情
 */
async function getItem(event, wxContext) {
  const { OPENID } = wxContext
  const { itemId } = event
  
  const result = await itemsCollection.doc(itemId).get()
  
  if (!result.data) {
    return {
      success: false,
      error: {
        code: 'ITEM_NOT_FOUND',
        message: '藏品不存在'
      }
    }
  }
  
  if (result.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权查看此藏品'
      }
    }
  }
  
  return {
    success: true,
    data: result.data
  }
}

/**
 * 更新藏品
 */
async function updateItem(event, wxContext) {
  const { OPENID } = wxContext
  const { itemId, ...updateFields } = event
  
  // 检查权限
  const item = await itemsCollection.doc(itemId).get()
  
  if (!item.data || item.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权修改此藏品'
      }
    }
  }
  
  const updateData = {
    updatedAt: db.serverDate()
  }
  
  // 只更新传入的字段
  const allowedFields = [
    'title', 'subtitle', 'coverUrl', 'purchasePrice',
    'currency', 'purchaseDate', 'notes', 'status', 'extraFields'
  ]
  
  allowedFields.forEach(field => {
    if (updateFields[field] !== undefined) {
      if (field === 'extraFields') {
        // 合并 extraFields
        updateData.extraFields = {
          ...item.data.extraFields,
          ...updateFields.extraFields
        }
      } else {
        updateData[field] = updateFields[field]
      }
    }
  })
  
  await itemsCollection.doc(itemId).update({ data: updateData })
  
  return {
    success: true,
    data: {
      ...item.data,
      ...updateData
    }
  }
}

/**
 * 删除藏品
 */
async function deleteItem(event, wxContext) {
  const { OPENID } = wxContext
  const { itemId } = event
  
  // 检查权限
  const item = await itemsCollection.doc(itemId).get()
  
  if (!item.data || item.data.userId !== OPENID) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: '无权删除此藏品'
      }
    }
  }
  
  const { libraryId } = item.data
  
  await itemsCollection.doc(itemId).remove()
  
  // 更新书房的藏品数量
  await librariesCollection.doc(libraryId).update({
    data: {
      itemCount: _.inc(-1),
      updatedAt: db.serverDate()
    }
  })
  
  return {
    success: true
  }
}

/**
 * 去重检测
 */
async function checkDuplicate(event, wxContext) {
  const { OPENID } = wxContext
  const { type, isbn, barcode, title } = event
  
  let where = { userId: OPENID }
  
  // 优先使用 ISBN/条形码检测
  if (isbn) {
    where['extraFields.isbn'] = isbn
  } else if (barcode) {
    where['extraFields.barcode'] = barcode
  } else if (title) {
    // 使用标题模糊匹配
    where.title = db.RegExp({
      regexp: `^${title.trim()}$`,
      options: 'i'
    })
    if (type) {
      where.type = type
    }
  } else {
    return {
      success: true,
      data: { isDuplicate: false }
    }
  }
  
  const result = await itemsCollection
    .where(where)
    .limit(1)
    .get()
  
  if (result.data.length > 0) {
    const existingItem = result.data[0]
    
    // 获取书房名称
    const library = await librariesCollection.doc(existingItem.libraryId).get()
    
    return {
      success: true,
      data: {
        isDuplicate: true,
        existingItem: {
          _id: existingItem._id,
          title: existingItem.title,
          libraryId: existingItem.libraryId,
          libraryName: library.data?.name || '未知书房'
        }
      }
    }
  }
  
  return {
    success: true,
    data: { isDuplicate: false }
  }
}

/**
 * 批量创建藏品
 */
async function batchCreateItems(event, wxContext) {
  const { OPENID } = wxContext
  const { items } = event
  
  if (!Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_PARAMS',
        message: '无效的藏品列表'
      }
    }
  }
  
  const results = []
  const libraryUpdates = {}
  
  for (const item of items) {
    const newItem = {
      ...item,
      userId: OPENID,
      status: 'in_library',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
    
    const result = await itemsCollection.add({ data: newItem })
    results.push({
      _id: result._id,
      title: item.title,
      success: true
    })
    
    // 累计书房更新
    if (!libraryUpdates[item.libraryId]) {
      libraryUpdates[item.libraryId] = 0
    }
    libraryUpdates[item.libraryId]++
  }
  
  // 批量更新书房藏品数量
  for (const [libraryId, count] of Object.entries(libraryUpdates)) {
    await librariesCollection.doc(libraryId).update({
      data: {
        itemCount: _.inc(count),
        updatedAt: db.serverDate()
      }
    })
  }
  
  return {
    success: true,
    data: {
      created: results.length,
      results
    }
  }
}

// 云函数入口
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action } = event
  
  switch (action) {
    case 'create':
      return createItem(event, wxContext)
    case 'list':
      return getItems(event, wxContext)
    case 'get':
      return getItem(event, wxContext)
    case 'update':
      return updateItem(event, wxContext)
    case 'delete':
      return deleteItem(event, wxContext)
    case 'checkDuplicate':
      return checkDuplicate(event, wxContext)
    case 'batchCreate':
      return batchCreateItems(event, wxContext)
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
