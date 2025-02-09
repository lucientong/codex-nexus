const { get } = require('../../../utils/request')
const { formatDate } = require('../../../utils/util')

Page({
  data: {
    currentType: '', // 当前类型筛选
    records: [], // 阅读记录列表
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    loading: false, // 加载中
    hasMore: true, // 是否有更多
    refreshing: false, // 下拉刷新状态
    showNoteModal: false, // 是否显示笔记弹窗
    currentNote: '' // 当前查看的笔记内容
  },

  onLoad() {
    this.loadRecords()
  },

  // 切换类型
  handleChangeType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentType: type,
      records: [],
      page: 1,
      hasMore: true
    }, () => {
      this.loadRecords()
    })
  },

  // 加载记录
  async loadRecords() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const params = {
        page: this.data.page,
        page_size: this.data.pageSize
      }
      if (this.data.currentType) {
        params.collection_type = this.data.currentType
      }

      const res = await get('/reading-records', params)
      
      // 格式化日期
      const records = res.items.map(item => ({
        ...item,
        start_time: formatDate(item.start_time, 'YYYY-MM-DD HH:mm'),
        end_time: item.end_time ? formatDate(item.end_time, 'YYYY-MM-DD HH:mm') : null
      }))

      this.setData({
        records: [...this.data.records, ...records],
        page: this.data.page + 1,
        hasMore: records.length === this.data.pageSize
      })
    } catch (error) {
      console.error('获取阅读记录失败：', error)
      wx.showToast({
        title: '获取记录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ 
        loading: false,
        refreshing: false
      })
    }
  },

  // 查看笔记
  handleViewNote(e) {
    const id = e.currentTarget.dataset.id
    const record = this.data.records.find(item => item.id === id)
    if (record && record.note) {
      this.setData({
        showNoteModal: true,
        currentNote: record.note
      })
    }
  },

  // 关闭笔记弹窗
  handleCloseNote() {
    this.setData({
      showNoteModal: false,
      currentNote: ''
    })
  },

  // 下拉刷新
  handleRefresh() {
    this.setData({
      records: [],
      page: 1,
      hasMore: true,
      refreshing: true
    }, () => {
      this.loadRecords()
    })
  },

  // 加载更多
  handleLoadMore() {
    this.loadRecords()
  }
}) 