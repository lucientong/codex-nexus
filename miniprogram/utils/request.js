const app = getApp()
const BASE_URL = 'http://localhost:8000/api/v1'  // 开发环境地址

const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    wx.request({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          // token失效，清除登录状态
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.navigateTo({
            url: '/pages/login/index'
          })
          reject(new Error('未授权'))
          return
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

const get = (url, options = {}) => {
  return request(url, {
    method: 'GET',
    ...options
  })
}

const post = (url, data, options = {}) => {
  return request(url, {
    method: 'POST',
    data,
    ...options
  })
}

const put = (url, data, options = {}) => {
  return request(url, {
    method: 'PUT',
    data,
    ...options
  })
}

const del = (url, options = {}) => {
  return request(url, {
    method: 'DELETE',
    ...options
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del
} 