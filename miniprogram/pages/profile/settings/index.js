Page({
  data: {
    language: 'zh_CN',
    theme: 'light',
    fontSize: 16,
    showBorrowRecords: true,
    showReadingRecords: true,
    cacheSize: '0MB',
    version: '1.0.0',
    languages: [
      { name: '简体中文', value: 'zh_CN' },
      { name: 'English', value: 'en_US' }
    ],
    themes: [
      { name: '浅色', value: 'light' },
      { name: '深色', value: 'dark' },
      { name: '跟随系统', value: 'system' }
    ]
  },

  onLoad() {
    this.loadSettings()
    this.calculateCacheSize()
  },

  loadSettings() {
    const settings = wx.getStorageSync('settings') || {}
    this.setData({
      language: settings.language || 'zh_CN',
      theme: settings.theme || 'light',
      fontSize: settings.fontSize || 16,
      showBorrowRecords: settings.showBorrowRecords !== false,
      showReadingRecords: settings.showReadingRecords !== false
    })
  },

  calculateCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        const sizeInMB = (res.currentSize / 1024).toFixed(2)
        this.setData({
          cacheSize: `${sizeInMB}MB`
        })
      }
    })
  },

  handleLanguageChange() {
    wx.showActionSheet({
      itemList: this.data.languages.map(lang => lang.name),
      success: (res) => {
        const language = this.data.languages[res.tapIndex].value
        this.setData({ language })
        this.saveSettings()
      }
    })
  },

  handleThemeChange() {
    wx.showActionSheet({
      itemList: this.data.themes.map(theme => theme.name),
      success: (res) => {
        const theme = this.data.themes[res.tapIndex].value
        this.setData({ theme })
        this.saveSettings()
        this.applyTheme(theme)
      }
    })
  },

  handleFontSizeChange(e) {
    const fontSize = e.detail.value
    this.setData({ fontSize })
    this.saveSettings()
  },

  handleBorrowRecordsSwitch(e) {
    this.setData({
      showBorrowRecords: e.detail.value
    })
    this.saveSettings()
  },

  handleReadingRecordsSwitch(e) {
    this.setData({
      showReadingRecords: e.detail.value
    })
    this.saveSettings()
  },

  handleClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({
                title: '缓存已清除',
                icon: 'success'
              })
              this.calculateCacheSize()
            }
          })
        }
      }
    })
  },

  handlePrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/profile/settings/privacy/index'
    })
  },

  handleUserAgreement() {
    wx.navigateTo({
      url: '/pages/profile/settings/agreement/index'
    })
  },

  saveSettings() {
    const settings = {
      language: this.data.language,
      theme: this.data.theme,
      fontSize: this.data.fontSize,
      showBorrowRecords: this.data.showBorrowRecords,
      showReadingRecords: this.data.showReadingRecords
    }
    wx.setStorageSync('settings', settings)
  },

  applyTheme(theme) {
    if (theme === 'system') {
      // 跟随系统设置
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
    } else if (theme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
    }
  }
}) 