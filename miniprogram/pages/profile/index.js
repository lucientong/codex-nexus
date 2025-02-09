// pages/profile/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取用户信息
    this.getUserInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新用户信息
    this.getUserInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          userInfo
        })
      }
    } catch (error) {
      console.error('获取用户信息失败：', error)
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    }
  },

  // 编辑资料
  handleEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit/index'
    })
  },

  // 借阅记录
  handleBorrowRecords() {
    wx.navigateTo({
      url: '/pages/profile/borrow-records/index'
    })
  },

  // 阅读记录
  handleReadingRecords() {
    wx.navigateTo({
      url: '/pages/profile/reading-records/index'
    })
  },

  // 设置
  handleSettings() {
    wx.navigateTo({
      url: '/pages/profile/settings/index'
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          // 更新页面状态
          this.setData({
            userInfo: null
          })
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/index'
          })
        }
      }
    })
  }
})