/**
 * 扫码录入页面
 * 支持连续扫码模式、扫码结果预览、快速确认添加
 */
import { View, Text, Image, Switch } from '@tarojs/components'
import { useLoad, useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { useItemStore } from '../../stores'
import { externalService } from '../../services'
import type { ItemType, CreateItemParams, BookExtraFields, MusicExtraFields } from '../../types'
import './scan.scss'

interface ScannedItem {
  code: string
  title: string
  subtitle?: string
  coverUrl?: string
  creator?: string
  publisher?: string
  year?: string
  type: ItemType
  rawData?: Record<string, unknown>
  status: 'pending' | 'added' | 'failed' | 'duplicate'
}

export default function Scan() {
  const [continuousMode, setContinuousMode] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
  const [currentPreview, setCurrentPreview] = useState<ScannedItem | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { createItem, checkDuplicate } = useItemStore()
  
  // 获取路由参数
  const getParams = useCallback(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    return {
      libraryId: params.libraryId || '',
      type: (params.type as ItemType) || 'book',
      initialCode: params.code ? decodeURIComponent(params.code) : undefined
    }
  }, [])

  useLoad(() => {
    const { initialCode } = getParams()
    if (initialCode) {
      handleScanResult(initialCode)
    }
  })

  useDidShow(() => {
    // 页面显示时自动开始扫码（如果没有预览项）
    if (!currentPreview && scannedItems.length === 0) {
      startScan()
    }
  })

  // 开始扫码
  const startScan = useCallback(async () => {
    if (isScanning) return
    setIsScanning(true)
    
    const result = await Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode']
    }).catch(() => null)
    
    setIsScanning(false)
    
    if (result?.result) {
      await handleScanResult(result.result)
      
      // 连续扫码模式下自动继续
      if (continuousMode && !currentPreview) {
        setTimeout(startScan, 500)
      }
    }
  }, [isScanning, continuousMode, currentPreview])

  // 处理扫码结果
  const handleScanResult = useCallback(async (code: string) => {
    const { type, libraryId } = getParams()
    setLoading(true)
    
    // 检查是否已扫描过
    const alreadyScanned = scannedItems.find(item => item.code === code)
    if (alreadyScanned) {
      Taro.showToast({ title: '已扫描过此条码', icon: 'none' })
      setLoading(false)
      return
    }
    
    // 检查是否已存在于书房
    const duplicateResult = await checkDuplicate({
      type,
      isbn: type === 'book' ? code : undefined,
      barcode: type !== 'book' ? code : undefined
    })
    
    if (duplicateResult.isDuplicate) {
      const dupItem: ScannedItem = {
        code,
        title: duplicateResult.existingItem?.title || '已存在的藏品',
        coverUrl: duplicateResult.existingItem?.coverUrl,
        type,
        status: 'duplicate'
      }
      setScannedItems(prev => [dupItem, ...prev])
      Taro.showToast({ title: '此藏品已存在', icon: 'none' })
      setLoading(false)
      return
    }
    
    // 调用外部 API 查询信息
    let itemInfo: ScannedItem
    
    if (type === 'book') {
      const bookResult = await externalService.searchBookByISBN(code)
      if (bookResult.success && bookResult.data) {
        const book = bookResult.data
        itemInfo = {
          code,
          title: book.title,
          subtitle: book.subtitle,
          coverUrl: book.coverUrl,
          creator: book.authors?.join(', '),
          publisher: book.publisher,
          year: book.publishDate,
          type: 'book',
          rawData: book as unknown as Record<string, unknown>,
          status: 'pending'
        }
      } else {
        itemInfo = {
          code,
          title: `ISBN: ${code}`,
          type: 'book',
          status: 'pending'
        }
      }
    } else {
      // CD / 黑胶
      const musicResult = await externalService.searchMusicByBarcode(code)
      if (musicResult.success && musicResult.data) {
        const music = musicResult.data
        itemInfo = {
          code,
          title: music.title,
          coverUrl: music.coverUrl,
          creator: music.artist,
          publisher: music.label,
          year: music.releaseDate,
          type,
          rawData: music as unknown as Record<string, unknown>,
          status: 'pending'
        }
      } else {
        itemInfo = {
          code,
          title: `条码: ${code}`,
          type,
          status: 'pending'
        }
      }
    }
    
    setCurrentPreview(itemInfo)
    setLoading(false)
  }, [getParams, scannedItems, checkDuplicate])

  // 确认添加当前预览项
  const confirmAdd = useCallback(async () => {
    if (!currentPreview) return
    
    const { libraryId, type } = getParams()
    setLoading(true)
    
    // 构建创建参数
    const createParams: CreateItemParams = {
      libraryId,
      type,
      title: currentPreview.title,
      subtitle: currentPreview.subtitle,
      coverUrl: currentPreview.coverUrl,
      extraFields: type === 'book'
        ? {
            authors: currentPreview.creator?.split(', ') || [],
            publisher: currentPreview.publisher,
            publishDate: currentPreview.year,
            isbn: currentPreview.code
          } as BookExtraFields
        : {
            artist: currentPreview.creator || '',
            label: currentPreview.publisher,
            releaseDate: currentPreview.year,
            barcode: currentPreview.code
          } as MusicExtraFields
    }
    
    const result = await createItem(createParams)
    
    if (result) {
      // 更新状态为已添加
      setScannedItems(prev => [{ ...currentPreview, status: 'added' as const }, ...prev])
      setCurrentPreview(null)
      Taro.showToast({ title: '添加成功', icon: 'success' })
      
      // 连续扫码模式下自动继续
      if (continuousMode) {
        setTimeout(startScan, 800)
      }
    } else {
      Taro.showToast({ title: '添加失败', icon: 'none' })
    }
    
    setLoading(false)
  }, [currentPreview, getParams, createItem, continuousMode, startScan])

  // 跳过当前预览
  const skipCurrent = useCallback(() => {
    if (currentPreview) {
      setScannedItems(prev => [{ ...currentPreview, status: 'failed' as const }, ...prev])
      setCurrentPreview(null)
      
      if (continuousMode) {
        setTimeout(startScan, 300)
      }
    }
  }, [currentPreview, continuousMode, startScan])

  // 手动录入
  const goManual = useCallback(() => {
    const { libraryId, type } = getParams()
    const code = currentPreview?.code || ''
    Taro.navigateTo({
      url: `/pages/add-item/manual?libraryId=${libraryId}&type=${type}&code=${code}`
    })
  }, [getParams, currentPreview])

  const addedCount = scannedItems.filter(item => item.status === 'added').length

  return (
    <View className='scan-page'>
      {/* 顶部控制栏 */}
      <View className='control-bar'>
        <View className='mode-switch'>
          <Text className='switch-label'>连续扫码</Text>
          <Switch
            checked={continuousMode}
            onChange={(e) => setContinuousMode(e.detail.value)}
            color='#8B4513'
          />
        </View>
        <View className='scan-counter'>
          <Text className='counter-num'>{addedCount}</Text>
          <Text className='counter-label'>已添加</Text>
        </View>
      </View>

      {/* 扫码预览区域 */}
      {currentPreview ? (
        <View className='preview-card'>
          <View className='preview-header'>
            <Text className='preview-title'>扫码结果</Text>
            {loading && <View className='loading-dot' />}
          </View>
          
          <View className='preview-content'>
            <View className='preview-cover'>
              {currentPreview.coverUrl ? (
                <Image
                  src={currentPreview.coverUrl}
                  mode='aspectFill'
                  className='cover-image'
                />
              ) : (
                <View className='cover-placeholder'>
                  <Text className='placeholder-emoji'>
                    {currentPreview.type === 'book' ? '📚' : '💿'}
                  </Text>
                </View>
              )}
            </View>
            
            <View className='preview-info'>
              <Text className='info-title'>{currentPreview.title}</Text>
              {currentPreview.subtitle && (
                <Text className='info-subtitle'>{currentPreview.subtitle}</Text>
              )}
              {currentPreview.creator && (
                <Text className='info-creator'>{currentPreview.creator}</Text>
              )}
              {currentPreview.publisher && (
                <Text className='info-publisher'>{currentPreview.publisher}</Text>
              )}
              <Text className='info-code'>条码: {currentPreview.code}</Text>
            </View>
          </View>
          
          <View className='preview-actions'>
            <View className='action-btn secondary' onClick={skipCurrent}>
              <Text>跳过</Text>
            </View>
            <View className='action-btn secondary' onClick={goManual}>
              <Text>编辑</Text>
            </View>
            <View className='action-btn primary' onClick={confirmAdd}>
              <Text>添加</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className='scan-prompt' onClick={startScan}>
          <View className='scan-icon-wrapper'>
            <Text className='scan-icon'>📷</Text>
            <View className='scan-ring' />
          </View>
          <Text className='scan-text'>
            {isScanning ? '正在扫描...' : '点击开始扫码'}
          </Text>
          <Text className='scan-hint'>支持 ISBN、EAN、UPC 等条码格式</Text>
        </View>
      )}

      {/* 已扫描列表 */}
      {scannedItems.length > 0 && (
        <View className='scanned-list'>
          <Text className='list-title'>扫描记录</Text>
          {scannedItems.map((item, index) => (
            <View key={`${item.code}-${index}`} className={`scanned-item ${item.status}`}>
              <View className='item-cover-small'>
                {item.coverUrl ? (
                  <Image src={item.coverUrl} mode='aspectFill' className='cover-thumb' />
                ) : (
                  <Text className='cover-emoji'>{item.type === 'book' ? '📚' : '💿'}</Text>
                )}
              </View>
              <View className='item-info'>
                <Text className='item-title'>{item.title}</Text>
                <Text className='item-code'>{item.code}</Text>
              </View>
              <View className={`item-status ${item.status}`}>
                <Text className='status-icon'>
                  {item.status === 'added' ? '✓' : item.status === 'duplicate' ? '⚠' : '✕'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 底部操作栏 */}
      <View className='bottom-bar'>
        <View className='bar-btn' onClick={startScan}>
          <Text className='btn-icon'>📷</Text>
          <Text className='btn-text'>继续扫码</Text>
        </View>
        <View className='bar-btn' onClick={goManual}>
          <Text className='btn-icon'>✏️</Text>
          <Text className='btn-text'>手动录入</Text>
        </View>
      </View>
    </View>
  )
}
