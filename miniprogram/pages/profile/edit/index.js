const { put } = require('../../../utils/request')

Page({
  data: {
    form: {
      nickname: '',
      avatar_url: '',
      email: '',
      phone: '',
      bio: ''
    },
    submitting: false
  },

  onLoad() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        form: {
          nickname: userInfo.nickname || '',
          avatar_url: userInfo.avatar_url || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          bio: userInfo.bio || ''
        }
      })
    }
  },

  // 上传头像
  async handleUploadAvatar() {
    try {
      // 选择图片
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      // TODO: 上传图片到服务器
      // const res = await uploadFile(tempFilePaths[0])
      
      // 临时使用本地图片
      this.setData({
        'form.avatar_url': tempFilePaths[0]
      })
    } catch (error) {
      console.error('上传头像失败：', error)
      wx.showToast({
        title: '上传头像失败',
        icon: 'none'
      })
    }
  },

  // 提交表单
  async handleSubmit(e) {
    if (this.data.submitting) return

    const formData = e.detail.value
    
    // 表单验证
    if (!formData.nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    if (formData.email && !this.validateEmail(formData.email)) {
      wx.showToast({
        title: '邮箱格式不正确',
        icon: 'none'
      })
      return
    }

    if (formData.phone && !this.validatePhone(formData.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    this.setData({ submitting: true })

    try {
      // 调用后端接口更新用户信息
      const res = await put('/auth/me', {
        ...formData,
        avatar_url: this.data.form.avatar_url
      })

      // 更新本地存储
      const userInfo = wx.getStorageSync('userInfo')
      wx.setStorageSync('userInfo', {
        ...userInfo,
        ...formData,
        avatar_url: this.data.form.avatar_url
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('更新用户信息失败：', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 验证邮箱
  validateEmail(email) {
    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    return reg.test(email)
  },

  // 验证手机号
  validatePhone(phone) {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
  }
}) 