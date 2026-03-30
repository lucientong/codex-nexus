/**
 * 录入方式选择页面
 * 提供扫码录入、搜索录入、手动录入三种入口
 */
import { View, Text, Image } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import './index.scss'

// 录入方式配置
const ADD_METHODS = [
  {
    id: 'scan',
    title: '扫码录入',
    subtitle: '扫描 ISBN、条形码快速添加',
    icon: '📷',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/pages/add-item/scan'
  },
  {
    id: 'search',
    title: '搜索录入',
    subtitle: '按书名、作者、编号搜索',
    icon: '🔍',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    path: '/pages/add-item/search'
  },
  {
    id: 'manual',
    title: '手动录入',
    subtitle: '完整表单自定义录入',
    icon: '✏️',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    path: '/pages/add-item/manual'
  }
]

// 快捷录入类型
const QUICK_TYPES = [
  { id: 'book', label: '图书', emoji: '📚', color: '#8B4513' },
  { id: 'cd', label: 'CD', emoji: '💿', color: '#1890FF' },
  { id: 'vinyl', label: '黑胶', emoji: '🎵', color: '#2D2D2D' }
]

export default function AddItem() {
  const [selectedType, setSelectedType] = useState<string>('book')
  const [animatedCards, setAnimatedCards] = useState<boolean[]>([false, false, false])

  useLoad(() => {
    // 入场动画：依次显示卡片
    ADD_METHODS.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedCards(prev => {
          const newState = [...prev]
          newState[index] = true
          return newState
        })
      }, 100 + index * 120)
    })
  })

  // 导航到录入页面
  const navigateToMethod = useCallback((path: string) => {
    const libraryId = Taro.getCurrentInstance().router?.params?.libraryId || ''
    Taro.navigateTo({
      url: `${path}?libraryId=${libraryId}&type=${selectedType}`
    })
  }, [selectedType])

  // 快捷扫码（直接调用扫码）
  const quickScan = useCallback(async () => {
    const result = await Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode']
    })
    
    if (result.result) {
      const libraryId = Taro.getCurrentInstance().router?.params?.libraryId || ''
      Taro.navigateTo({
        url: `/pages/add-item/scan?libraryId=${libraryId}&type=${selectedType}&code=${encodeURIComponent(result.result)}`
      })
    }
  }, [selectedType])

  return (
    <View className='add-item-page'>
      {/* 顶部装饰 */}
      <View className='page-header'>
        <View className='header-bg'>
          <View className='circle circle-1' />
          <View className='circle circle-2' />
          <View className='circle circle-3' />
        </View>
        <View className='header-content'>
          <Text className='header-title'>添加藏品</Text>
          <Text className='header-subtitle'>选择你喜欢的方式开始收藏</Text>
        </View>
      </View>

      {/* 快捷类型选择 */}
      <View className='type-selector'>
        <Text className='section-label'>选择类型</Text>
        <View className='type-chips'>
          {QUICK_TYPES.map(type => (
            <View
              key={type.id}
              className={`type-chip ${selectedType === type.id ? 'active' : ''}`}
              style={selectedType === type.id ? { borderColor: type.color, backgroundColor: `${type.color}15` } : {}}
              onClick={() => setSelectedType(type.id)}
            >
              <Text className='chip-emoji'>{type.emoji}</Text>
              <Text className='chip-label' style={selectedType === type.id ? { color: type.color } : {}}>
                {type.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 录入方式卡片 */}
      <View className='method-cards'>
        {ADD_METHODS.map((method, index) => (
          <View
            key={method.id}
            className={`method-card ${animatedCards[index] ? 'visible' : ''}`}
            onClick={() => navigateToMethod(method.path)}
          >
            <View className='card-icon-wrapper' style={{ background: method.gradient }}>
              <Text className='card-icon'>{method.icon}</Text>
            </View>
            <View className='card-content'>
              <Text className='card-title'>{method.title}</Text>
              <Text className='card-subtitle'>{method.subtitle}</Text>
            </View>
            <View className='card-arrow'>
              <Text className='arrow-icon'>›</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 快捷扫码悬浮按钮 */}
      <View className='quick-scan-fab' onClick={quickScan}>
        <View className='fab-inner'>
          <Text className='fab-icon'>📷</Text>
          <View className='fab-pulse' />
        </View>
        <Text className='fab-label'>快速扫码</Text>
      </View>

      {/* 提示信息 */}
      <View className='tips-section'>
        <Text className='tips-title'>💡 小贴士</Text>
        <View className='tips-content'>
          <Text className='tip-item'>• 扫码支持 ISBN、EAN、UPC 等多种条码格式</Text>
          <Text className='tip-item'>• 连续扫码模式可以批量添加多本书</Text>
          <Text className='tip-item'>• 搜索不到时可以手动录入补充信息</Text>
        </View>
      </View>
    </View>
  )
}
