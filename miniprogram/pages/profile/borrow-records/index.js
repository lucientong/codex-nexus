const { get, put } = require('../../../utils/request')
const { formatDate } = require('../../../utils/util')

Page({
  data: {
    currentStatus: '', // 当前状态筛选
    records: [], // 借阅记录列表
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    loading: false, // 加载中
    hasMore: true, // 是否有更多
    refreshing: false, // 下拉刷新状态
    statusMap: {
      pending: '待审核',
      approved: '已借出',
      rejected: '已拒绝',
      returned: '已归还'
    }
  },

  onLoad() {
    this.loadRecords()
  },

  // 切换状态
  handleChangeStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      currentStatus: status,
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
      if (this.data.currentStatus) {
        params.status = this.data.currentStatus
      }

      const res = await get('/borrow-records', params)
      
      // 格式化日期
      const records = res.items.map(item => ({
        ...item,
        borrow_date: formatDate(item.borrow_date),
        return_date: item.return_date ? formatDate(item.return_date) : null
      }))

      this.setData({
        records: [...this.data.records, ...records],
        page: this.data.page + 1,
        hasMore: records.length === this.data.pageSize
      })
    } catch (error) {
      console.error('获取借阅记录失败：', error)
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

  // 归还藏品
  async handleReturn(e) {
    const id = e.currentTarget.dataset.id
    
    try {
      await wx.showModal({
        title: '提示',
        content: '确定要归还该藏品吗？'
      })

      await put(`/borrow-records/${id}/return`)

      // 更新记录状态
      const records = this.data.records.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'returned',
            return_date: formatDate(new Date())
          }
        }
        return item
      })

      this.setData({ records })

      wx.showToast({
        title: '归还成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('归还失败：', error)
      wx.showToast({
        title: '归还失败',
        icon: 'none'
      })
    }
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