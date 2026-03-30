/**
 * 藏品详情页
 * 展示藏品封面、详细信息、编辑删除等操作
 */
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useLoad, useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback, useMemo } from 'react'
import { useItemStore } from '../../stores'
import type { Item, ItemType, BookItem, CDItem, VinylItem } from '../../types'
import { ITEM_TYPE_CONFIG, CURRENCY_SYMBOL } from '../../types/item'
import { formatDate, formatPrice } from '../../utils'
import './index.scss'

export default function ItemDetail() {
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  
  const { fetchItem, deleteItem, currentItem, setCurrentItem } = useItemStore()
  
  // 获取路由参数
  const getItemId = useCallback(() => {
    return Taro.getCurrentInstance().router?.params?.id || ''
  }, [])

  useLoad(async () => {
    const itemId = getItemId()
    if (itemId) {
      setLoading(true)
      await fetchItem(itemId)
      setLoading(false)
    }
  })

  useDidShow(() => {
    // 从 store 获取当前藏品
    if (currentItem) {
      setItem(currentItem)
    }
  })

  // 监听 currentItem 变化
  useMemo(() => {
    if (currentItem) {
      setItem(currentItem)
    }
  }, [currentItem])

  // 获取类型配置
  const typeConfig = useMemo(() => {
    return item ? ITEM_TYPE_CONFIG[item.type] : null
  }, [item])

  // 获取创作者信息
  const creator = useMemo(() => {
    if (!item) return ''
    if (item.type === 'book') {
      return (item as BookItem).extraFields.authors?.join('、') || ''
    }
    return (item as CDItem | VinylItem).extraFields.artist || ''
  }, [item])

  // 获取出版/发行信息
  const publishInfo = useMemo(() => {
    if (!item) return null
    const fields = item.extraFields
    
    if (item.type === 'book') {
      const bookFields = fields as BookItem['extraFields']
      return {
        publisher: bookFields.publisher,
        date: bookFields.publishDate,
        identifier: bookFields.isbn,
        identifierLabel: 'ISBN',
        extra: [
          bookFields.pages ? `${bookFields.pages}页` : null,
          bookFields.language
        ].filter(Boolean).join(' · ')
      }
    } else {
      const musicFields = fields as CDItem['extraFields']
      return {
        publisher: musicFields.label,
        date: musicFields.releaseDate,
        identifier: musicFields.barcode,
        identifierLabel: '条形码',
        extra: [
          musicFields.format,
          musicFields.trackCount ? `${musicFields.trackCount}首曲目` : null,
          musicFields.genre?.join(' / ')
        ].filter(Boolean).join(' · ')
      }
    }
  }, [item])

  // 编辑
  const handleEdit = useCallback(() => {
    if (!item) return
    const libraryId = item.libraryId
    Taro.navigateTo({
      url: `/pages/add-item/manual?libraryId=${libraryId}&type=${item.type}&edit=${item._id}`
    })
  }, [item])

  // 删除
  const handleDelete = useCallback(async () => {
    if (!item) return
    
    const res = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除「${item.title}」吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#FF4D4F',
      cancelText: '取消'
    })
    
    if (!res.confirm) return
    
    setDeleting(true)
    const success = await deleteItem(item._id)
    setDeleting(false)
    
    if (success) {
      Taro.showToast({ title: '删除成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } else {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }, [item, deleteItem])

  // 分享
  const handleShare = useCallback(() => {
    // TODO: 实现分享功能
    Taro.showToast({ title: '分享功能开发中', icon: 'none' })
  }, [])

  if (loading) {
    return (
      <View className='item-detail-page loading'>
        <View className='loading-spinner' />
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (!item) {
    return (
      <View className='item-detail-page empty'>
        <Text className='empty-icon'>📭</Text>
        <Text className='empty-text'>藏品不存在或已被删除</Text>
        <View className='back-btn' onClick={() => Taro.navigateBack()}>
          <Text>返回</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='item-detail-page'>
      {/* 封面展示区 */}
      <View className='cover-section'>
        <View className='cover-bg'>
          {item.coverUrl && (
            <Image src={item.coverUrl} mode='aspectFill' className='bg-blur' />
          )}
          <View className='bg-overlay' />
        </View>
        
        <View className='cover-content'>
          <View className={`cover-wrapper ${item.type}`}>
            {item.coverUrl ? (
              <Image
                src={item.coverUrl}
                mode='aspectFill'
                className='cover-image'
                onClick={() => {
                  Taro.previewImage({ urls: [item.coverUrl!], current: item.coverUrl })
                }}
              />
            ) : (
              <View className='cover-placeholder'>
                <Text className='placeholder-emoji'>{typeConfig?.icon === 'book' ? '📚' : '💿'}</Text>
              </View>
            )}
            
            {/* 唱片装饰 */}
            {(item.type === 'cd' || item.type === 'vinyl') && (
              <View className='vinyl-disc'>
                <View className='disc-inner' />
              </View>
            )}
          </View>
          
          {/* 类型标签 */}
          <View className='type-tag' style={{ backgroundColor: typeConfig?.color }}>
            <Text>{typeConfig?.label}</Text>
          </View>
        </View>
      </View>

      {/* 信息区域 */}
      <ScrollView className='info-scroll' scrollY>
        {/* 标题区 */}
        <View className='title-section'>
          <Text className='item-title'>{item.title}</Text>
          {item.subtitle && <Text className='item-subtitle'>{item.subtitle}</Text>}
          {creator && <Text className='item-creator'>{creator}</Text>}
        </View>

        {/* 详细信息卡片 */}
        <View className='info-card'>
          <View className='card-header'>
            <Text className='card-title'>详细信息</Text>
          </View>
          
          <View className='info-list'>
            {publishInfo?.publisher && (
              <View className='info-item'>
                <Text className='item-label'>{item.type === 'book' ? '出版社' : '厂牌'}</Text>
                <Text className='item-value'>{publishInfo.publisher}</Text>
              </View>
            )}
            
            {publishInfo?.date && (
              <View className='info-item'>
                <Text className='item-label'>{item.type === 'book' ? '出版日期' : '发行日期'}</Text>
                <Text className='item-value'>{publishInfo.date}</Text>
              </View>
            )}
            
            {publishInfo?.identifier && (
              <View className='info-item'>
                <Text className='item-label'>{publishInfo.identifierLabel}</Text>
                <Text className='item-value mono'>{publishInfo.identifier}</Text>
              </View>
            )}
            
            {publishInfo?.extra && (
              <View className='info-item'>
                <Text className='item-label'>其他</Text>
                <Text className='item-value'>{publishInfo.extra}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 购买信息卡片 */}
        {(item.purchasePrice || item.purchaseDate) && (
          <View className='info-card purchase'>
            <View className='card-header'>
              <Text className='card-title'>购买信息</Text>
            </View>
            
            <View className='purchase-display'>
              {item.purchasePrice && (
                <View className='price-block'>
                  <Text className='price-label'>购买价格</Text>
                  <Text className='price-value'>
                    {CURRENCY_SYMBOL[item.currency]}{formatPrice(item.purchasePrice)}
                  </Text>
                </View>
              )}
              
              {item.purchaseDate && (
                <View className='date-block'>
                  <Text className='date-label'>购买日期</Text>
                  <Text className='date-value'>{formatDate(item.purchaseDate)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 备注卡片 */}
        {item.notes && (
          <View className='info-card notes'>
            <View className='card-header'>
              <Text className='card-title'>备注</Text>
            </View>
            <Text className='notes-content'>{item.notes}</Text>
          </View>
        )}

        {/* 元信息 */}
        <View className='meta-info'>
          <Text className='meta-item'>添加于 {formatDate(item.createdAt)}</Text>
          {item.updatedAt !== item.createdAt && (
            <Text className='meta-item'>更新于 {formatDate(item.updatedAt)}</Text>
          )}
        </View>

        {/* 占位 */}
        <View style={{ height: '200rpx' }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='action-bar'>
        <View className='action-btn share' onClick={handleShare}>
          <Text className='btn-icon'>📤</Text>
          <Text className='btn-text'>分享</Text>
        </View>
        <View className='action-btn edit' onClick={handleEdit}>
          <Text className='btn-icon'>✏️</Text>
          <Text className='btn-text'>编辑</Text>
        </View>
        <View
          className={`action-btn delete ${deleting ? 'loading' : ''}`}
          onClick={!deleting ? handleDelete : undefined}
        >
          <Text className='btn-icon'>🗑️</Text>
          <Text className='btn-text'>{deleting ? '删除中' : '删除'}</Text>
        </View>
      </View>
    </View>
  )
}
