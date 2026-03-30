/**
 * 统计页面
 * 展示藏品多维度统计数据和可视化图表
 */
import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { useItemStore, useLibraryStore } from '../../stores'
import type { ItemType, Item, Library } from '../../types'
import { ITEM_TYPE_CONFIG, CURRENCY_SYMBOL } from '../../types/item'
import { formatPrice } from '../../utils'
import './index.scss'

interface StatsData {
  totalCount: number
  totalValue: number
  typeDistribution: { type: ItemType; count: number; percentage: number }[]
  monthlyTrend: { month: string; count: number }[]
  topAuthors: { name: string; count: number }[]
  topPublishers: { name: string; count: number }[]
  recentItems: Item[]
}

const INITIAL_STATS: StatsData = {
  totalCount: 0,
  totalValue: 0,
  typeDistribution: [],
  monthlyTrend: [],
  topAuthors: [],
  topPublishers: [],
  recentItems: []
}

export default function Statistics() {
  const [stats, setStats] = useState<StatsData>(INITIAL_STATS)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'ranking'>('overview')
  
  const { items } = useItemStore()
  const { libraries } = useLibraryStore()

  // 计算统计数据
  const calculateStats = useCallback(async () => {
    setLoading(true)
    
    // 调用云函数获取统计数据
    const result = await Taro.cloud.callFunction({
      name: 'item-service',
      data: { action: 'statistics' }
    }).catch(() => null)
    
    if (result?.result) {
      const res = result.result as { success: boolean; data?: StatsData }
      if (res.success && res.data) {
        setStats(res.data)
        setLoading(false)
        return
      }
    }
    
    // 降级：本地计算
    calculateLocalStats()
    setLoading(false)
  }, [])

  // 本地计算统计（作为降级方案）
  const calculateLocalStats = useCallback(() => {
    if (!items.length) {
      setStats(INITIAL_STATS)
      return
    }
    
    // 总数和总价值
    const totalCount = items.length
    const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0)
    
    // 类型分布
    const typeCounts: Record<ItemType, number> = {
      book: 0, cd: 0, vinyl: 0, dvd: 0, magazine: 0
    }
    items.forEach(item => typeCounts[item.type]++)
    
    const typeDistribution = Object.entries(typeCounts)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as ItemType,
        count,
        percentage: Math.round((count / totalCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
    
    // 月度趋势（最近 6 个月）
    const monthlyData: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[key] = 0
    }
    
    items.forEach(item => {
      const date = new Date(item.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (key in monthlyData) {
        monthlyData[key]++
      }
    })
    
    const monthlyTrend = Object.entries(monthlyData).map(([month, count]) => ({
      month: month.split('-')[1] + '月',
      count
    }))
    
    // 作者/艺术家排行
    const authorCounts: Record<string, number> = {}
    items.forEach(item => {
      if (item.type === 'book' && item.extraFields) {
        const authors = (item.extraFields as { authors?: string[] }).authors || []
        authors.forEach(author => {
          authorCounts[author] = (authorCounts[author] || 0) + 1
        })
      } else if ((item.type === 'cd' || item.type === 'vinyl') && item.extraFields) {
        const artist = (item.extraFields as { artist?: string }).artist
        if (artist) {
          authorCounts[artist] = (authorCounts[artist] || 0) + 1
        }
      }
    })
    
    const topAuthors = Object.entries(authorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    // 出版社/厂牌排行
    const publisherCounts: Record<string, number> = {}
    items.forEach(item => {
      const publisher = (item.extraFields as { publisher?: string; label?: string }).publisher ||
        (item.extraFields as { publisher?: string; label?: string }).label
      if (publisher) {
        publisherCounts[publisher] = (publisherCounts[publisher] || 0) + 1
      }
    })
    
    const topPublishers = Object.entries(publisherCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    // 最近添加
    const recentItems = [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    setStats({
      totalCount,
      totalValue,
      typeDistribution,
      monthlyTrend,
      topAuthors,
      topPublishers,
      recentItems
    })
  }, [items])

  useLoad(() => {
    calculateStats()
  })

  useDidShow(() => {
    calculateStats()
  })

  // 渲染类型分布图表（使用纯 CSS 实现简易饼图效果）
  const renderTypeChart = () => {
    if (!stats.typeDistribution.length) return null
    
    let rotation = 0
    const segments = stats.typeDistribution.map(item => {
      const config = ITEM_TYPE_CONFIG[item.type]
      const segment = {
        ...item,
        color: config.color,
        rotation,
        angle: (item.percentage / 100) * 360
      }
      rotation += segment.angle
      return segment
    })
    
    return (
      <View className='pie-chart'>
        <View className='pie-segments'>
          {segments.map((seg, index) => (
            <View
              key={seg.type}
              className='pie-segment'
              style={{
                background: `conic-gradient(${seg.color} 0deg, ${seg.color} ${seg.angle}deg, transparent ${seg.angle}deg)`,
                transform: `rotate(${seg.rotation}deg)`
              }}
            />
          ))}
          <View className='pie-center'>
            <Text className='center-num'>{stats.totalCount}</Text>
            <Text className='center-label'>总计</Text>
          </View>
        </View>
        <View className='pie-legend'>
          {stats.typeDistribution.map(item => (
            <View key={item.type} className='legend-item'>
              <View className='legend-dot' style={{ backgroundColor: ITEM_TYPE_CONFIG[item.type].color }} />
              <Text className='legend-label'>{ITEM_TYPE_CONFIG[item.type].label}</Text>
              <Text className='legend-value'>{item.count}</Text>
              <Text className='legend-percent'>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  // 渲染趋势图（使用纯 CSS 实现条形图）
  const renderTrendChart = () => {
    if (!stats.monthlyTrend.length) return null
    
    const maxCount = Math.max(...stats.monthlyTrend.map(m => m.count), 1)
    
    return (
      <View className='bar-chart'>
        <View className='chart-bars'>
          {stats.monthlyTrend.map((item, index) => (
            <View key={item.month} className='bar-item'>
              <View className='bar-wrapper'>
                <View
                  className='bar-fill'
                  style={{
                    height: `${(item.count / maxCount) * 100}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {item.count > 0 && <Text className='bar-value'>{item.count}</Text>}
                </View>
              </View>
              <Text className='bar-label'>{item.month}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  // 渲染排行榜
  const renderRanking = (data: { name: string; count: number }[], title: string) => {
    if (!data.length) {
      return (
        <View className='ranking-empty'>
          <Text>暂无数据</Text>
        </View>
      )
    }
    
    const maxCount = data[0]?.count || 1
    
    return (
      <View className='ranking-list'>
        {data.map((item, index) => (
          <View key={item.name} className='ranking-item'>
            <View className={`rank-badge ${index < 3 ? `top-${index + 1}` : ''}`}>
              <Text>{index + 1}</Text>
            </View>
            <View className='rank-info'>
              <Text className='rank-name'>{item.name}</Text>
              <View className='rank-bar-wrapper'>
                <View
                  className='rank-bar'
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </View>
            </View>
            <Text className='rank-count'>{item.count}</Text>
          </View>
        ))}
      </View>
    )
  }

  if (loading) {
    return (
      <View className='statistics-page loading'>
        <View className='loading-spinner' />
        <Text className='loading-text'>统计中...</Text>
      </View>
    )
  }

  return (
    <View className='statistics-page'>
      <ScrollView className='stats-scroll' scrollY>
        {/* 总览卡片 */}
        <View className='overview-cards'>
          <View className='stat-card primary'>
            <Text className='card-icon'>📚</Text>
            <View className='card-content'>
              <Text className='card-value'>{stats.totalCount}</Text>
              <Text className='card-label'>藏品总数</Text>
            </View>
          </View>
          
          <View className='stat-card secondary'>
            <Text className='card-icon'>💰</Text>
            <View className='card-content'>
              <Text className='card-value'>
                {CURRENCY_SYMBOL.CNY}{formatPrice(stats.totalValue)}
              </Text>
              <Text className='card-label'>估计价值</Text>
            </View>
          </View>
        </View>

        {/* 选项卡导航 */}
        <View className='tab-nav'>
          {[
            { key: 'overview', label: '分类统计' },
            { key: 'trend', label: '趋势分析' },
            { key: 'ranking', label: '排行榜' }
          ].map(tab => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>

        {/* 内容区域 */}
        <View className='content-section'>
          {activeTab === 'overview' && (
            <View className='chart-section'>
              <View className='section-header'>
                <Text className='section-title'>藏品类型分布</Text>
              </View>
              {stats.typeDistribution.length > 0 ? (
                renderTypeChart()
              ) : (
                <View className='empty-chart'>
                  <Text className='empty-icon'>📊</Text>
                  <Text className='empty-text'>还没有藏品数据</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'trend' && (
            <View className='chart-section'>
              <View className='section-header'>
                <Text className='section-title'>月度新增趋势</Text>
                <Text className='section-subtitle'>最近 6 个月</Text>
              </View>
              {renderTrendChart()}
            </View>
          )}

          {activeTab === 'ranking' && (
            <View className='ranking-section'>
              <View className='ranking-block'>
                <View className='block-header'>
                  <Text className='block-title'>🏆 作者 / 艺术家 TOP 10</Text>
                </View>
                {renderRanking(stats.topAuthors, '作者')}
              </View>
              
              <View className='ranking-block'>
                <View className='block-header'>
                  <Text className='block-title'>🏢 出版社 / 厂牌 TOP 10</Text>
                </View>
                {renderRanking(stats.topPublishers, '出版社')}
              </View>
            </View>
          )}
        </View>

        {/* 占位 */}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
