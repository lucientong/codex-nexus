const { get, post, put } = require('../../../utils/request')
const { t } = require('../../../utils/i18n')

Page({
  data: {
    id: null,
    form: {
      name: '',
      description: '',
      visibility: 'private'
    },
    visibilityOptions: [
      { label: '私密', value: 'private' },
      { label: '好友可见', value: 'friends' },
      { label: '公开', value: 'public' }
    ],
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadLibrary()
    }
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: options.id ? '编辑书房' : '创建书房'
    })
  },

  async loadLibrary() {
    try {
      const library = await get(`/libraries/${this.data.id}`)
      this.setData({
        form: {
          name: library.name,
          description: library.description || '',
          visibility: library.visibility
        }
      })
    } catch (error) {
      console.error('加载书房信息失败:', error)
      wx.showToast({
        title: t('common.networkError'),
        icon: 'none'
      })
    }
  },

  handleVisibilityChange(e) {
    this.setData({
      'form.visibility': e.detail.value
    })
  },

  async handleSubmit(e) {
    const { name, description } = e.detail.value
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入书房名称',
        icon: 'none'
      })
      return
    }
    
    if (this.data.submitting) return
    this.setData({ submitting: true })
    
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        visibility: this.data.form.visibility
      }
      
      if (this.data.id) {
        // 更新书房
        await put(`/libraries/${this.data.id}`, data)
      } else {
        // 创建书房
        await post('/libraries', data)
      }
      
      wx.showToast({
        title: t(this.data.id ? 'library.updateSuccess' : 'library.createSuccess'),
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
            libraries: []
          }, () => {
            prevPage.loadLibraries()
          })
        }
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存书房失败:', error)
      wx.showToast({
        title: t('common.error'),
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  }
}) 