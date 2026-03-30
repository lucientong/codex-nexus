/**
 * 首页 - 书房列表
 * 设计理念：温暖质感的私人书房入口，木质纹理配合柔和光影
 */
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useLoad, usePullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { useUserStore, useLibraryStore } from '../../stores'
import type { LibraryListItem } from '../../types'
import './index.scss'

// 书房卡片组件
function LibraryCard({ library, index }: { library: LibraryListItem; index: number }) {
  const handleClick = useCallback(() => {
    Taro.navigateTo({
      url: `/pages/library/index?id=${library._id}`
    })
  }, [library._id])
  
  // 延迟动画
  const animationDelay = `${index * 0.08}s`
  
  return (
    <View 
      className='library-card animate-slideUp' 
      style={{ animationDelay }}
      onClick={handleClick}
    >
      {/* 封面预览区域 */}
      <View className='card-covers'>
        {library.previewCovers.length > 0 ? (
          <View className='covers-grid'>
            {library.previewCovers.slice(0, 4).map((cover, i) => (
              <Image 
                key={i} 
                className='cover-item' 
                src={cover} 
                mode='aspectFill'
                lazyLoad
              />
            ))}
          </View>
        ) : (
          <View className='empty-covers'>
            <View className='shelf-lines'>
              <View className='shelf-line' />
              <View className='shelf-line' />
              <View className='shelf-line' />
            </View>
            <Text className='empty-text'>空书房</Text>
          </View>
        )}
      </View>
      
      {/* 信息区域 */}
      <View className='card-info'>
        <Text className='library-name text-ellipsis'>{library.name}</Text>
        <View className='library-meta'>
          <Text className='item-count'>{library.itemCount} 件藏品</Text>
          {library.description && (
            <Text className='description text-ellipsis'>{library.description}</Text>
          )}
        </View>
      </View>
      
      {/* 装饰角标 */}
      <View className='card-corner' />
    </View>
  )
}

// 创建书房弹窗
function CreateLibraryModal({ 
  visible, 
  onClose, 
  onSubmit 
}: { 
  visible: boolean
  onClose: () => void
  onSubmit: (name: string, description: string) => void 
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入书房名称', icon: 'none' })
      return
    }
    
    setLoading(true)
    await onSubmit(name.trim(), description.trim())
    setLoading(false)
    setName('')
    setDescription('')
  }
  
  if (!visible) return null
  
  return (
    <View className='modal-overlay' onClick={onClose}>
      <View className='modal-content animate-scaleIn' onClick={e => e.stopPropagation()}>
        <View className='modal-header'>
          <Text className='modal-title'>创建新书房</Text>
          <View className='modal-close' onClick={onClose}>
            <Text className='close-icon'>×</Text>
          </View>
        </View>
        
        <View className='modal-body'>
          <View className='form-group'>
            <Text className='form-label'>书房名称</Text>
            <input
              className='form-input'
              placeholder='给你的书房起个名字'
              value={name}
              onInput={(e: any) => setName(e.detail.value)}
              maxLength={20}
            />
          </View>
          
          <View className='form-group'>
            <Text className='form-label'>描述 (选填)</Text>
            <textarea
              className='form-textarea'
              placeholder='简单描述一下这个书房...'
              value={description}
              onInput={(e: any) => setDescription(e.detail.value)}
              maxLength={100}
            />
          </View>
        </View>
        
        <View className='modal-footer'>
          <View className='btn btn-secondary' onClick={onClose}>
            <Text>取消</Text>
          </View>
          <View 
            className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} 
            onClick={handleSubmit}
          >
            <Text>{loading ? '创建中...' : '创建书房'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

// 空状态组件
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <View className='empty-state animate-fadeIn'>
      <View className='empty-illustration'>
        {/* 书架插图 */}
        <View className='bookshelf-icon'>
          <View className='shelf' />
          <View className='shelf' />
          <View className='shelf' />
          <View className='book book-1' />
          <View className='book book-2' />
          <View className='book book-3' />
        </View>
      </View>
      <Text className='empty-title'>还没有书房</Text>
      <Text className='empty-desc'>创建你的第一个书房，开始记录你的收藏</Text>
      <View className='btn btn-primary btn-large' onClick={onCreate}>
        <Text>创建书房</Text>
      </View>
    </View>
  )
}

export default function Index() {
  const { user, login, isLoggedIn } = useUserStore()
  const { libraries, loading, refreshing, fetchLibraries, createLibrary } = useLibraryStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // 页面加载
  useLoad(async () => {
    // 登录
    if (!isLoggedIn) {
      await login()
    }
    // 获取书房列表
    await fetchLibraries(true)
  })
  
  // 下拉刷新
  usePullDownRefresh(async () => {
    await fetchLibraries(true)
    stopPullDownRefresh()
  })
  
  // 创建书房
  const handleCreateLibrary = async (name: string, description: string) => {
    const result = await createLibrary({ name, description })
    if (result) {
      setShowCreateModal(false)
      Taro.showToast({ title: '创建成功', icon: 'success' })
    }
  }
  
  return (
    <View className='index-page'>
      {/* 顶部区域 */}
      <View className='page-header'>
        <View className='header-content'>
          <View className='brand'>
            <Text className='brand-name'>藏书云廊</Text>
            <Text className='brand-slogan'>管理你的私人收藏</Text>
          </View>
          
          {user && (
            <View className='user-info'>
              <Image 
                className='user-avatar' 
                src={user.avatarUrl || 'https://placehold.co/80x80/8B4513/FFFFFF?text=U'} 
                mode='aspectFill'
              />
            </View>
          )}
        </View>
        
        {/* 统计概览 */}
        {user && user.stats && (
          <View className='stats-overview'>
            <View className='stat-item'>
              <Text className='stat-value'>{user.stats.libraryCount}</Text>
              <Text className='stat-label'>书房</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>{user.stats.itemCount}</Text>
              <Text className='stat-label'>藏品</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>
                {user.stats.totalValue > 0 ? `¥${user.stats.totalValue.toFixed(0)}` : '-'}
              </Text>
              <Text className='stat-label'>总价值</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* 书房列表 */}
      <View className='page-content'>
        {loading && libraries.length === 0 ? (
          <View className='loading-state'>
            <View className='loading-spinner' />
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : libraries.length === 0 ? (
          <EmptyState onCreate={() => setShowCreateModal(true)} />
        ) : (
          <ScrollView 
            className='library-list' 
            scrollY 
            enhanced
            showScrollbar={false}
          >
            <View className='list-header'>
              <Text className='list-title'>我的书房</Text>
              <View 
                className='add-btn' 
                onClick={() => setShowCreateModal(true)}
              >
                <Text className='add-icon'>+</Text>
                <Text className='add-text'>新建</Text>
              </View>
            </View>
            
            <View className='library-grid'>
              {libraries.map((library, index) => (
                <LibraryCard key={library._id} library={library} index={index} />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      
      {/* 悬浮添加按钮 */}
      {libraries.length > 0 && (
        <View 
          className='fab-button animate-scaleIn'
          onClick={() => setShowCreateModal(true)}
        >
          <Text className='fab-icon'>+</Text>
        </View>
      )}
      
      {/* 创建书房弹窗 */}
      <CreateLibraryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateLibrary}
      />
    </View>
  )
}
