const { get, post, put, uploadFile } = require('../../../utils/request')
const { t } = require('../../../utils/i18n')

Page({
  data: {
    id: null,
    type: null,
    form: {
      title: '',
      cover_url: '',
      description: '',
      purchase_price: '',
      market_price: '',
      location: '',
      // 图书特有字段
      isbn: '',
      author: '',
      publisher: '',
      publish_date: '',
      language: '',
      page_count: '',
      // 杂志特有字段
      issn: '',
      issue_number: '',
      // CD特有字段
      isrc: '',
      artist: '',
      label: '',
      release_date: '',
      genre: '',
      duration: '',
      // 黑胶特有字段
      rpm: '',
      size: '',
      // DVD特有字段
      isan: '',
      director: '',
      studio: '',
      region_code: '',
      // 游戏卡带特有字段
      product_code: '',
      developer: '',
      platform: '',
      region: ''
    },
    submitting: false
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ type: options.type })
    }
    if (options.id) {
      this.setData({ id: options.id })
      this.loadCollection()
    }
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.id ? '编辑藏品' : '新增藏品'
    })
  },

  async loadCollection() {
    try {
      const collection = await get(`/collections/${this.data.id}`)
      this.setData({ form: collection })
    } catch (error) {
      console.error('加载藏品详情失败:', error)
      wx.showToast({
        title: t('common.networkError'),
        icon: 'none'
      })
    }
  },

  handlePublishDateChange(e) {
    this.setData({
      'form.publish_date': e.detail.value
    })
  },

  handleReleaseDateChange(e) {
    this.setData({
      'form.release_date': e.detail.value
    })
  },

  async handleUploadCover() {
    try {
      // 选择图片
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (tempFilePaths && tempFilePaths.length > 0) {
        // 显示上传中
        wx.showLoading({
          title: '上传中...',
          mask: true
        })

        // 上传图片
        const result = await uploadFile('/upload/image', tempFilePaths[0])
        const data = JSON.parse(result)

        // 更新封面地址
        this.setData({
          'form.cover_url': data.url
        })

        wx.hideLoading()
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('上传封面失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || t('common.error'),
        icon: 'none'
      })
    }
  },

  async handleSubmit(e) {
    const formData = e.detail.value

    // 表单验证
    if (!formData.title) {
      wx.showToast({
        title: '请输入藏品标题',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ submitting: true })

      // 准备提交的数据
      const data = {
        ...formData,
        type: this.data.type
      }

      // 处理数字类型字段
      if (data.purchase_price) {
        data.purchase_price = parseFloat(data.purchase_price)
      }
      if (data.market_price) {
        data.market_price = parseFloat(data.market_price)
      }
      if (data.page_count) {
        data.page_count = parseInt(data.page_count)
      }
      if (data.duration) {
        data.duration = parseInt(data.duration)
      }
      if (data.rpm) {
        data.rpm = parseInt(data.rpm)
      }
      if (data.size) {
        data.size = parseFloat(data.size)
      }

      // 添加封面地址
      if (this.data.form.cover_url) {
        data.cover_url = this.data.form.cover_url
      }

      // 创建或更新藏品
      if (this.data.id) {
        await put(`/collections/${this.data.id}`, data)
      } else {
        await post('/collections', data)
      }

      wx.showToast({
        title: this.data.id ? '更新成功' : '创建成功',
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
      console.error('提交表单失败:', error)
      wx.showToast({
        title: error.message || t('common.error'),
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  }
}) 