Page({
  data: {
    // 页面的初始数据
  },

  onLoad() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '用户协议'
    })
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: '藏书云廊用户协议',
      path: '/pages/profile/settings/agreement/index'
    }
  }
}) 