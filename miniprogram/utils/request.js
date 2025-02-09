const config = require('../config/index')

const request = (method, url, data = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    
    wx.request({
      url: `${config.apiBaseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 401) {
          // token过期，跳转到登录页
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.redirectTo({
            url: '/pages/login/index'
          })
          reject(new Error('未授权'))
          return
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

const get = (url, data) => request('GET', url, data)
const post = (url, data) => request('POST', url, data)
const put = (url, data) => request('PUT', url, data)
const del = (url, data) => request('DELETE', url, data)

module.exports = {
  get,
  post,
  put,
  delete: del
} 