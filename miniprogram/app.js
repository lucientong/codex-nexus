App({
  globalData: {
    userInfo: null,
    token: null,
    systemInfo: null,
    language: 'zh-CN'
  },

  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo

    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.checkSession()
    }

    // 获取用户设置的语言
    const language = wx.getStorageSync('language') || 'zh-CN'
    this.globalData.language = language
  },

  checkSession() {
    wx.checkSession({
      fail: () => {
        // session失效，清除登录状态
        this.globalData.token = null
        this.globalData.userInfo = null
        wx.removeStorageSync('token')
        wx.removeStorageSync('userInfo')
      }
    })
  },

  // 设置语言
  setLanguage(language) {
    this.globalData.language = language
    wx.setStorageSync('language', language)
  }
}) 