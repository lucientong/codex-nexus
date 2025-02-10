// pages/collection/index.js
const { get } = require('../../utils/request')
const { t } = require('../../utils/i18n')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    currentType: 'all',
    collectionTypes: [
      { label: '全部', value: 'all' },
      { label: '图书', value: 'book' },
      { label: '杂志', value: 'magazine' },
      { label: 'CD', value: 'cd' },
      { label: '黑胶', value: 'vinyl' },
      { label: 'DVD', value: 'dvd' },
      { label: '游戏', value: 'game_cartridge' }
    ],
    statusMap: {
      available: '在库',
      borrowed: '已借出',
      lost: '遗失'
    },
    collections: [],
    loading: false,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    showAddPopup: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果有传入类型参数，设置当前类型
    if (options.type) {
      this.setData({ currentType: options.type })
    }
    this.loadCollections()
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
      hasMore: true,
      collections: []
    }, () => {
      this.loadCollections()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.handleLoadMore()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  async loadCollections() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const params = {
        page: this.data.page,
        page_size: this.data.pageSize,
        keyword: this.data.keyword
      }
      
      if (this.data.currentType !== 'all') {
        params.type = this.data.currentType
      }
      
      const res = await get('/collections', params)
      
      const collections = this.data.page === 1 
        ? res.items 
        : [...this.data.collections, ...res.items]
      
      this.setData({
        collections,
        hasMore: res.total > collections.length
      })
    } catch (error) {
      console.error('加载藏品列表失败:', error)
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
      keyword: e.detail.value
    })
  },

  handleSearch() {
    this.setData({
      page: 1,
      hasMore: true,
      collections: []
    }, () => {
      this.loadCollections()
    })
  },

  handleChangeType(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      currentType: type,
      page: 1,
      hasMore: true,
      collections: []
    }, () => {
      this.loadCollections()
    })
  },

  handleLoadMore() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadCollections()
    })
  },

  handleViewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/collection/detail/index?id=${id}`
    })
  },

  handleAdd() {
    this.setData({ showAddPopup: true })
  },

  handleClosePopup() {
    this.setData({ showAddPopup: false })
  },

  handleScan() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res)
        // TODO: 处理扫码结果
        this.handleClosePopup()
      },
      fail: (error) => {
        console.error('扫码失败:', error)
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      }
    })
  },

  handlePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // TODO: 上传图片并识别
        this.handleClosePopup()
      }
    })
  },

  handleManual() {
    wx.navigateTo({
      url: `/pages/collection/edit/index?type=${this.data.currentType === 'all' ? 'book' : this.data.currentType}`
    })
    this.handleClosePopup()
  }
})