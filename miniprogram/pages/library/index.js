// pages/library/index.js
const { get, del } = require('../../utils/request')
const { t } = require('../../utils/i18n')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    libraries: [],
    loading: false,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    visibilityMap: {
      private: '私密',
      friends: '好友可见',
      public: '公开'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadLibraries()
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
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    }, () => {
      this.loadLibraries()
    })
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

  async loadLibraries() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const params = {
        page: this.data.page,
        page_size: this.data.pageSize,
        keyword: this.data.keyword
      }
      
      const res = await get('/libraries', params)
      
      const libraries = this.data.page === 1 
        ? res.items 
        : [...this.data.libraries, ...res.items]
      
      this.setData({
        libraries,
        hasMore: res.total > libraries.length
      })
    } catch (error) {
      console.error('加载书房列表失败:', error)
      wx.showToast({
        title: t('common.networkError'),
        icon: 'none'
      })
    } finally {
      this.setData({ 
        loading: false,
        refreshing: false
      })
      wx.stopPullDownRefresh()
    }
  },

  handleSearchInput(e) {
    this.setData({
      keyword: e.detail.value,
      page: 1,
      hasMore: true,
      libraries: []
    }, () => {
      this.loadLibraries()
    })
  },

  handleLoadMore() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadLibraries()
    })
  },

  handleCreateLibrary() {
    wx.navigateTo({
      url: '/pages/library/edit/index'
    })
  },

  handleEditLibrary(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/library/edit/index?id=${id}`
    })
  },

  async handleDeleteLibrary(e) {
    const { id } = e.currentTarget.dataset
    
    const confirmed = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '删除书房将同时删除其中的所有藏品，确定要删除吗？',
        confirmText: '删除',
        confirmColor: '#ff4d4f',
        success: (res) => resolve(res.confirm)
      })
    })
    
    if (!confirmed) return
    
    try {
      await del(`/libraries/${id}`)
      
      // 从列表中移除
      const libraries = this.data.libraries.filter(item => item.id !== id)
      this.setData({ libraries })
      
      wx.showToast({
        title: t('library.deleteSuccess'),
        icon: 'success'
      })
    } catch (error) {
      console.error('删除书房失败:', error)
      wx.showToast({
        title: t('common.error'),
        icon: 'none'
      })
    }
  },

  handleViewLibrary(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/library/detail/index?id=${id}`
    })
  }
})