Page({
  data: {
    // 页面的初始数据
  },

  onLoad() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '隐私政策'
    })
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: '藏书云廊隐私政策',
      path: '/pages/profile/settings/privacy/index'
    }
  }
}) 