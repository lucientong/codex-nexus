/**
 * 我的页面
 * 展示用户信息、功能入口、设置等
 */
import { View, Text, Image, Button } from '@tarojs/components'
import { useLoad, useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { useUserStore, useLibraryStore, useItemStore } from '../../stores'
import './index.scss'

// 功能菜单配置
const MENU_ITEMS = [
  {
    id: 'libraries',
    icon: '📚',
    title: '我的书房',
    subtitle: '查看所有书房',
    path: '/pages/index/index'
  },
  {
    id: 'favorites',
    icon: '⭐',
    title: '我的收藏',
    subtitle: '收藏的藏品',
    disabled: true
  },
  {
    id: 'history',
    icon: '🕐',
    title: '浏览历史',
    subtitle: '最近查看的藏品',
    disabled: true
  },
  {
    id: 'export',
    icon: '📤',
    title: '数据导出',
    subtitle: '导出藏品数据',
    disabled: true
  }
]

const SETTING_ITEMS = [
  {
    id: 'notification',
    icon: '🔔',
    title: '消息通知',
    disabled: true
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: '隐私设置',
    disabled: true
  },
  {
    id: 'about',
    icon: 'ℹ️',
    title: '关于我们'
  },
  {
    id: 'feedback',
    icon: '💬',
    title: '意见反馈'
  }
]

export default function Profile() {
  const [stats, setStats] = useState({
    libraryCount: 0,
    itemCount: 0,
    readingCount: 0
  })
  
  const { user, isLoggedIn, login, logout } = useUserStore()
  const { libraries } = useLibraryStore()
  const { items } = useItemStore()

  useLoad(() => {
    updateStats()
  })

  useDidShow(() => {
    updateStats()
  })

  // 更新统计数据
  const updateStats = useCallback(() => {
    setStats({
      libraryCount: libraries.length,
      itemCount: items.length,
      readingCount: 0 // TODO: 阅读中的数量
    })
  }, [libraries, items])

  // 处理登录
  const handleLogin = useCallback(async () => {
    await login()
  }, [login])

  // 处理登出
  const handleLogout = useCallback(async () => {
    const res = await Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消'
    })
    
    if (res.confirm) {
      await logout()
      Taro.showToast({ title: '已退出登录', icon: 'success' })
    }
  }, [logout])

  // 处理菜单点击
  const handleMenuClick = useCallback((item: typeof MENU_ITEMS[0]) => {
    if (item.disabled) {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
      return
    }
    
    if (item.path) {
      Taro.navigateTo({ url: item.path })
    }
  }, [])

  // 处理设置点击
  const handleSettingClick = useCallback((item: typeof SETTING_ITEMS[0]) => {
    if (item.disabled) {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
      return
    }
    
    switch (item.id) {
      case 'about':
        Taro.showModal({
          title: '关于藏书云廊',
          content: '版本 1.0.0\n\n一款专注于个人藏品管理的小程序，帮助你记录每一本书、每一张唱片。\n\n© 2024 Codex Nexus',
          showCancel: false
        })
        break
      case 'feedback':
        Taro.showModal({
          title: '意见反馈',
          content: '如有问题或建议，请发送邮件至：\nfeedback@codex-nexus.app',
          showCancel: false
        })
        break
    }
  }, [])

  return (
    <View className='profile-page'>
      {/* 用户信息区 */}
      <View className='user-section'>
        <View className='user-bg'>
          <View className='bg-pattern' />
        </View>
        
        <View className='user-content'>
          {isLoggedIn && user ? (
            <View className='user-info'>
              <View className='avatar-wrapper'>
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} className='avatar-image' mode='aspectFill' />
                ) : (
                  <View className='avatar-placeholder'>
                    <Text className='avatar-emoji'>👤</Text>
                  </View>
                )}
              </View>
              <Text className='user-name'>{user.nickname || '藏书家'}</Text>
              <Text className='user-id'>ID: {user._id?.slice(-8) || 'xxxxxxxx'}</Text>
            </View>
          ) : (
            <View className='login-prompt'>
              <View className='avatar-wrapper'>
                <View className='avatar-placeholder'>
                  <Text className='avatar-emoji'>👤</Text>
                </View>
              </View>
              <Text className='prompt-text'>登录后同步您的藏品数据</Text>
              <Button className='login-btn' openType='getUserInfo' onGetUserInfo={handleLogin}>
                微信登录
              </Button>
            </View>
          )}
        </View>
      </View>

      {/* 数据统计 */}
      <View className='stats-section'>
        <View className='stat-item'>
          <Text className='stat-num'>{stats.libraryCount}</Text>
          <Text className='stat-label'>书房</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-num'>{stats.itemCount}</Text>
          <Text className='stat-label'>藏品</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-num'>{stats.readingCount}</Text>
          <Text className='stat-label'>在读</Text>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className='menu-section'>
        <Text className='section-title'>我的功能</Text>
        <View className='menu-list'>
          {MENU_ITEMS.map(item => (
            <View
              key={item.id}
              className={`menu-item ${item.disabled ? 'disabled' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <Text className='menu-icon'>{item.icon}</Text>
              <View className='menu-content'>
                <Text className='menu-title'>{item.title}</Text>
                <Text className='menu-subtitle'>{item.subtitle}</Text>
              </View>
              <Text className='menu-arrow'>›</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 设置菜单 */}
      <View className='menu-section'>
        <Text className='section-title'>设置</Text>
        <View className='menu-list settings'>
          {SETTING_ITEMS.map(item => (
            <View
              key={item.id}
              className={`menu-item ${item.disabled ? 'disabled' : ''}`}
              onClick={() => handleSettingClick(item)}
            >
              <Text className='menu-icon'>{item.icon}</Text>
              <Text className='menu-title'>{item.title}</Text>
              <Text className='menu-arrow'>›</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View className='logout-section'>
          <View className='logout-btn' onClick={handleLogout}>
            <Text>退出登录</Text>
          </View>
        </View>
      )}

      {/* 版本信息 */}
      <View className='version-info'>
        <Text>藏书云廊 v1.0.0</Text>
      </View>
    </View>
  )
}
