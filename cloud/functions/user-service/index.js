/**
 * 用户服务云函数
 * 处理用户登录、信息更新、设置管理等
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const usersCollection = db.collection('users')

// 默认用户设置
const DEFAULT_USER_SETTINGS = {
  theme: 'light',
  showPrice: true,
  defaultViewMode: 'shelf',
  notifications: {
    priceAlert: true,
    newFeature: true
  }
}

/**
 * 用户登录/注册
 */
async function login(event, wxContext) {
  const { OPENID } = wxContext
  
  // 查找用户
  const userResult = await usersCollection.where({ openid: OPENID }).get()
  
  if (userResult.data.length > 0) {
    // 已存在，更新最后登录时间并返回
    const user = userResult.data[0]
    await usersCollection.doc(user._id).update({
      data: {
        updatedAt: db.serverDate()
      }
    })
    return {
      success: true,
      data: user
    }
  }
  
  // 创建新用户
  const newUser = {
    openid: OPENID,
    nickname: event.nickname || '书友',
    avatarUrl: event.avatarUrl || '',
    settings: DEFAULT_USER_SETTINGS,
    stats: {
      libraryCount: 0,
      itemCount: 0,
      totalValue: 0
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }
  
  const createResult = await usersCollection.add({ data: newUser })
  
  return {
    success: true,
    data: {
      _id: createResult._id,
      ...newUser
    }
  }
}

/**
 * 获取用户信息
 */
async function getUserInfo(event, wxContext) {
  const { OPENID } = wxContext
  
  const userResult = await usersCollection.where({ openid: OPENID }).get()
  
  if (userResult.data.length === 0) {
    return {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在'
      }
    }
  }
  
  return {
    success: true,
    data: userResult.data[0]
  }
}

/**
 * 更新用户信息
 */
async function updateUserInfo(event, wxContext) {
  const { OPENID } = wxContext
  const { nickname, avatarUrl, settings } = event
  
  const userResult = await usersCollection.where({ openid: OPENID }).get()
  
  if (userResult.data.length === 0) {
    return {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在'
      }
    }
  }
  
  const user = userResult.data[0]
  const updateData = {
    updatedAt: db.serverDate()
  }
  
  if (nickname !== undefined) {
    updateData.nickname = nickname
  }
  
  if (avatarUrl !== undefined) {
    updateData.avatarUrl = avatarUrl
  }
  
  if (settings !== undefined) {
    updateData.settings = {
      ...user.settings,
      ...settings
    }
  }
  
  await usersCollection.doc(user._id).update({ data: updateData })
  
  return {
    success: true,
    data: {
      ...user,
      ...updateData
    }
  }
}

/**
 * 更新用户统计信息
 */
async function updateUserStats(event, wxContext) {
  const { OPENID } = wxContext
  
  // 统计书房数量
  const libraryCount = await db.collection('libraries')
    .where({ userId: OPENID })
    .count()
  
  // 统计藏品数量和总价值
  const itemsResult = await db.collection('items')
    .where({ userId: OPENID })
    .field({ purchasePrice: true })
    .get()
  
  const itemCount = itemsResult.data.length
  const totalValue = itemsResult.data.reduce((sum, item) => {
    return sum + (item.purchasePrice || 0)
  }, 0)
  
  // 更新用户统计
  await usersCollection.where({ openid: OPENID }).update({
    data: {
      stats: {
        libraryCount: libraryCount.total,
        itemCount,
        totalValue
      },
      updatedAt: db.serverDate()
    }
  })
  
  return {
    success: true,
    data: {
      libraryCount: libraryCount.total,
      itemCount,
      totalValue
    }
  }
}

// 云函数入口
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action } = event
  
  switch (action) {
    case 'login':
      return login(event, wxContext)
    case 'getUserInfo':
      return getUserInfo(event, wxContext)
    case 'updateUserInfo':
      return updateUserInfo(event, wxContext)
    case 'updateUserStats':
      return updateUserStats(event, wxContext)
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
