// pages/index/index.js
const { get } = require('../../utils/request')
const { t } = require('../../utils/i18n')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    banners: [
      {
        id: 1,
        image_url: '/assets/images/banner1.png'
      },
      {
        id: 2,
        image_url: '/assets/images/banner2.png'
      },
      {
        id: 3,
        image_url: '/assets/images/banner3.png'
      }
    ],
    latestCollections: [],
    recommendedCollections: [],
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData()
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
    this.loadData()
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

  async loadData() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      // 加载最新藏品
      const latestRes = await get('/collections/latest')
      // 加载推荐藏品
      const recommendedRes = await get('/collections/recommended')
      
      this.setData({
        latestCollections: this.formatCollections(latestRes),
        recommendedCollections: this.formatCollections(recommendedRes)
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      wx.showToast({
        title: t('common.networkError'),
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  formatCollections(collections) {
    const typeTextMap = {
      book: t('collection.books'),
      magazine: t('collection.magazines'),
      cd: t('collection.cds'),
      vinyl: t('collection.vinyls'),
      dvd: t('collection.dvds'),
      game_cartridge: t('collection.games')
    }
    
    return collections.map(item => ({
      ...item,
      type_text: typeTextMap[item.type] || item.type
    }))
  },

  handleSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  handleSearch() {
    if (!this.data.keyword.trim()) return
    
    wx.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(this.data.keyword)}`
    })
  },

  handleNavTo(e) {
    const { type } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/collection/list/index?type=${type}`
    })
  },

  handleViewDetail(e) {
    const { id, type } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/collection/detail/index?id=${id}&type=${type}`
    })
  },

  handleViewMore(e) {
    const { type } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/collection/list/index?listType=${type}`
    })
  }
})