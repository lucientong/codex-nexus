Page({
  data: {
    version: '1.0.0',
    year: new Date().getFullYear()
  },

  onLoad() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '关于藏书云廊'
    })
  },

  // 复制邮箱
  copyEmail() {
    wx.setClipboardData({
      data: 'support@codexnexus.com',
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        })
      }
    })
  },

  // 复制微信号
  copyWechat() {
    wx.setClipboardData({
      data: 'codexnexus',
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        })
      }
    })
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: '藏书云廊 - 您的私人藏品管理助手',
      path: '/pages/profile/settings/about/index'
    }
  }
}) 