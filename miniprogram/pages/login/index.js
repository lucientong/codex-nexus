const { post } = require('../../utils/request')

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 检查是否已经登录
    const token = wx.getStorageSync('token')
    if (token) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  handleImageError(e) {
    console.error('图片加载失败:', e.detail.errMsg)
  },

  handleLogin() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    wx.login({
      success: async (res) => {
        if (res.code) {
          try {
            // 调用后端登录接口
            const response = await post('/auth/login', {
              code: res.code
            })
            
            // 保存token和用户信息
            wx.setStorageSync('token', response.access_token)
            
            // 获取用户信息
            const userInfo = await this.getUserProfile()
            if (userInfo) {
              // 更新用户信息
              await post('/auth/me', {
                nickname: userInfo.userInfo.nickName,
                avatar_url: userInfo.userInfo.avatarUrl
              })
              
              wx.setStorageSync('userInfo', userInfo.userInfo)
            }
            
            // 跳转到首页
            wx.switchTab({
              url: '/pages/index/index'
            })
          } catch (error) {
            console.error('登录失败:', error)
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        } else {
          console.error('登录失败:', res.errMsg)
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      })
    })
  }
}) 