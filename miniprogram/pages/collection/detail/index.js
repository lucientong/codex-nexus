const { get, post, del } = require('../../../utils/request')
const { t } = require('../../../utils/i18n')

Page({
  data: {
    id: null,
    collection: null,
    typeMap: {
      book: '图书',
      magazine: '杂志',
      cd: 'CD',
      vinyl: '黑胶',
      dvd: 'DVD',
      game_cartridge: '游戏'
    },
    statusMap: {
      in_library: '在库',
      borrowed: '已借出',
      lost: '遗失'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadCollection()
    }
  },

  async loadCollection() {
    try {
      const collection = await get(`/collections/${this.data.id}`)
      this.setData({ collection })
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: collection.title
      })
    } catch (error) {
      console.error('加载藏品详情失败:', error)
      wx.showToast({
        title: t('common.networkError'),
        icon: 'none'
      })
    }
  },

  formatDuration(seconds) {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    let result = ''
    if (hours > 0) {
      result += `${hours}小时`
    }
    if (minutes > 0) {
      result += `${minutes}分钟`
    }
    if (remainingSeconds > 0) {
      result += `${remainingSeconds}秒`
    }
    return result
  },

  handleEdit() {
    wx.navigateTo({
      url: `/pages/collection/edit/index?id=${this.data.id}&type=${this.data.collection.type}`
    })
  },

  async handleBorrow() {
    try {
      await post(`/collections/${this.data.id}/borrow`)
      wx.showToast({
        title: t('borrow.request_success'),
        icon: 'success'
      })
      // 刷新藏品状态
      this.loadCollection()
    } catch (error) {
      console.error('借阅申请失败:', error)
      wx.showToast({
        title: error.message || t('common.error'),
        icon: 'none'
      })
    }
  },

  async handleReturn() {
    try {
      await post(`/collections/${this.data.id}/return`)
      wx.showToast({
        title: t('borrow.return_success'),
        icon: 'success'
      })
      // 刷新藏品状态
      this.loadCollection()
    } catch (error) {
      console.error('归还失败:', error)
      wx.showToast({
        title: error.message || t('common.error'),
        icon: 'none'
      })
    }
  },

  handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个藏品吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await del(`/collections/${this.data.id}`)
            wx.showToast({
              title: t('collection.delete_success'),
              icon: 'success'
            })
            // 返回上一页并刷新列表
            setTimeout(() => {
              const pages = getCurrentPages()
              const prevPage = pages[pages.length - 2]
              if (prevPage) {
                prevPage.setData({
                  page: 1,
                  hasMore: true,
                  collections: []
                }, () => {
                  prevPage.loadCollections()
                })
              }
              wx.navigateBack()
            }, 1500)
          } catch (error) {
            console.error('删除藏品失败:', error)
            wx.showToast({
              title: error.message || t('common.error'),
              icon: 'none'
            })
          }
        }
      }
    })
  }
}) 