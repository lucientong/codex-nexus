/**
 * 手动录入页面
 * 根据藏品类型展示不同的表单字段
 */
import { View, Text, Input, Textarea, Image, Picker, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback, useMemo } from 'react'
import { useItemStore } from '../../stores'
import type { ItemType, CreateItemParams, BookExtraFields, MusicExtraFields, Currency } from '../../types'
import { CURRENCY_SYMBOL, DEFAULT_CURRENCY } from '../../types/item'
import './manual.scss'

interface FormData {
  title: string
  subtitle: string
  coverUrl: string
  purchasePrice: string
  currency: Currency
  notes: string
  // 图书字段
  authors: string
  publisher: string
  publishDate: string
  isbn: string
  pages: string
  language: string
  // 音乐字段
  artist: string
  label: string
  releaseDate: string
  barcode: string
  genre: string
  format: string
  trackCount: string
}

const initialFormData: FormData = {
  title: '',
  subtitle: '',
  coverUrl: '',
  purchasePrice: '',
  currency: DEFAULT_CURRENCY,
  notes: '',
  authors: '',
  publisher: '',
  publishDate: '',
  isbn: '',
  pages: '',
  language: '',
  artist: '',
  label: '',
  releaseDate: '',
  barcode: '',
  genre: '',
  format: '',
  trackCount: ''
}

const CURRENCY_OPTIONS = ['CNY', 'USD', 'EUR', 'JPY', 'GBP']
const FORMAT_OPTIONS = ['CD', 'LP', 'EP', 'Single', '7"', '10"', '12"', 'Cassette', 'Box Set']
const LANGUAGE_OPTIONS = ['中文', 'English', '日本語', 'Français', 'Deutsch', '한국어', '其他']

export default function Manual() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  
  const { createItem } = useItemStore()
  
  // 获取路由参数
  const getParams = useCallback(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    return {
      libraryId: params.libraryId || '',
      type: (params.type as ItemType) || 'book'
    }
  }, [])

  useLoad(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    // 预填充数据
    if (params.title) {
      setFormData(prev => ({ ...prev, title: decodeURIComponent(params.title!) }))
    }
    if (params.creator) {
      const { type } = getParams()
      if (type === 'book') {
        setFormData(prev => ({ ...prev, authors: decodeURIComponent(params.creator!) }))
      } else {
        setFormData(prev => ({ ...prev, artist: decodeURIComponent(params.creator!) }))
      }
    }
    if (params.code) {
      const { type } = getParams()
      const code = decodeURIComponent(params.code!)
      if (type === 'book') {
        setFormData(prev => ({ ...prev, isbn: code }))
      } else {
        setFormData(prev => ({ ...prev, barcode: code }))
      }
    }
  })

  // 更新表单字段
  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // 选择封面图片
  const chooseCover = useCallback(async () => {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }).catch(() => null)
    
    if (!res?.tempFilePaths[0]) return
    
    setUploadingCover(true)
    
    // 上传到云存储
    const cloudPath = `covers/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
    
    const uploadRes = await Taro.cloud.uploadFile({
      filePath: res.tempFilePaths[0],
      cloudPath
    }).catch(() => null)
    
    setUploadingCover(false)
    
    if (uploadRes?.fileID) {
      setFormData(prev => ({ ...prev, coverUrl: uploadRes.fileID }))
      Taro.showToast({ title: '封面上传成功', icon: 'success' })
    } else {
      Taro.showToast({ title: '封面上传失败', icon: 'none' })
    }
  }, [])

  // 验证表单
  const validateForm = useCallback(() => {
    const { type } = getParams()
    
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return false
    }
    
    if (type !== 'book' && !formData.artist.trim()) {
      Taro.showToast({ title: '请输入艺术家', icon: 'none' })
      return false
    }
    
    return true
  }, [formData, getParams])

  // 提交表单
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return
    
    const { libraryId, type } = getParams()
    setSubmitting(true)
    
    const createParams: CreateItemParams = {
      libraryId,
      type,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim() || undefined,
      coverUrl: formData.coverUrl || undefined,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      currency: formData.currency,
      notes: formData.notes.trim() || undefined,
      extraFields: type === 'book'
        ? {
            authors: formData.authors.split(/[,，、]/).map(a => a.trim()).filter(Boolean),
            publisher: formData.publisher.trim() || undefined,
            publishDate: formData.publishDate.trim() || undefined,
            isbn: formData.isbn.trim() || undefined,
            pages: formData.pages ? parseInt(formData.pages) : undefined,
            language: formData.language || undefined
          } as BookExtraFields
        : {
            artist: formData.artist.trim(),
            label: formData.label.trim() || undefined,
            releaseDate: formData.releaseDate.trim() || undefined,
            barcode: formData.barcode.trim() || undefined,
            genre: formData.genre.split(/[,，、]/).map(g => g.trim()).filter(Boolean),
            format: formData.format || undefined,
            trackCount: formData.trackCount ? parseInt(formData.trackCount) : undefined
          } as MusicExtraFields
    }
    
    const result = await createItem(createParams)
    setSubmitting(false)
    
    if (result) {
      Taro.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } else {
      Taro.showToast({ title: '添加失败，请重试', icon: 'none' })
    }
  }, [formData, getParams, validateForm, createItem])

  const { type } = getParams()
  const isBook = type === 'book'
  const typeEmoji = isBook ? '📚' : type === 'vinyl' ? '🎵' : '💿'
  const typeLabel = isBook ? '图书' : type === 'vinyl' ? '黑胶唱片' : 'CD'

  return (
    <View className='manual-page'>
      <ScrollView className='form-scroll' scrollY>
        {/* 类型标识 */}
        <View className='type-badge'>
          <Text className='badge-emoji'>{typeEmoji}</Text>
          <Text className='badge-label'>{typeLabel}</Text>
        </View>

        {/* 封面上传 */}
        <View className='cover-section' onClick={chooseCover}>
          {formData.coverUrl ? (
            <Image src={formData.coverUrl} mode='aspectFill' className='cover-preview' />
          ) : (
            <View className='cover-placeholder'>
              {uploadingCover ? (
                <View className='uploading'>
                  <View className='upload-spinner' />
                  <Text className='upload-text'>上传中...</Text>
                </View>
              ) : (
                <>
                  <Text className='placeholder-icon'>📷</Text>
                  <Text className='placeholder-text'>点击上传封面</Text>
                </>
              )}
            </View>
          )}
          {formData.coverUrl && (
            <View className='cover-change'>
              <Text>更换</Text>
            </View>
          )}
        </View>

        {/* 基本信息 */}
        <View className='form-section'>
          <Text className='section-title'>基本信息</Text>
          
          <View className='form-item required'>
            <Text className='item-label'>标题</Text>
            <Input
              className='item-input'
              placeholder={isBook ? '请输入书名' : '请输入专辑名'}
              value={formData.title}
              onInput={(e) => updateField('title', e.detail.value)}
            />
          </View>
          
          <View className='form-item'>
            <Text className='item-label'>副标题</Text>
            <Input
              className='item-input'
              placeholder='选填'
              value={formData.subtitle}
              onInput={(e) => updateField('subtitle', e.detail.value)}
            />
          </View>

          {isBook ? (
            <>
              <View className='form-item'>
                <Text className='item-label'>作者</Text>
                <Input
                  className='item-input'
                  placeholder='多个作者用逗号分隔'
                  value={formData.authors}
                  onInput={(e) => updateField('authors', e.detail.value)}
                />
              </View>
              
              <View className='form-item'>
                <Text className='item-label'>出版社</Text>
                <Input
                  className='item-input'
                  placeholder='选填'
                  value={formData.publisher}
                  onInput={(e) => updateField('publisher', e.detail.value)}
                />
              </View>
              
              <View className='form-item'>
                <Text className='item-label'>出版日期</Text>
                <Picker
                  mode='date'
                  value={formData.publishDate}
                  onChange={(e) => updateField('publishDate', e.detail.value)}
                >
                  <View className='item-picker'>
                    <Text className={formData.publishDate ? '' : 'placeholder'}>
                      {formData.publishDate || '选择日期'}
                    </Text>
                    <Text className='picker-arrow'>›</Text>
                  </View>
                </Picker>
              </View>
              
              <View className='form-item'>
                <Text className='item-label'>ISBN</Text>
                <Input
                  className='item-input'
                  placeholder='选填'
                  value={formData.isbn}
                  onInput={(e) => updateField('isbn', e.detail.value)}
                />
              </View>
              
              <View className='form-row'>
                <View className='form-item half'>
                  <Text className='item-label'>页数</Text>
                  <Input
                    className='item-input'
                    type='number'
                    placeholder='选填'
                    value={formData.pages}
                    onInput={(e) => updateField('pages', e.detail.value)}
                  />
                </View>
                
                <View className='form-item half'>
                  <Text className='item-label'>语言</Text>
                  <Picker
                    mode='selector'
                    range={LANGUAGE_OPTIONS}
                    value={LANGUAGE_OPTIONS.indexOf(formData.language)}
                    onChange={(e) => updateField('language', LANGUAGE_OPTIONS[e.detail.value as number])}
                  >
                    <View className='item-picker'>
                      <Text className={formData.language ? '' : 'placeholder'}>
                        {formData.language || '选择'}
                      </Text>
                      <Text className='picker-arrow'>›</Text>
                    </View>
                  </Picker>
                </View>
              </View>
            </>
          ) : (
            <>
              <View className='form-item required'>
                <Text className='item-label'>艺术家</Text>
                <Input
                  className='item-input'
                  placeholder='请输入艺术家名称'
                  value={formData.artist}
                  onInput={(e) => updateField('artist', e.detail.value)}
                />
              </View>
              
              <View className='form-item'>
                <Text className='item-label'>厂牌</Text>
                <Input
                  className='item-input'
                  placeholder='选填'
                  value={formData.label}
                  onInput={(e) => updateField('label', e.detail.value)}
                />
              </View>
              
              <View className='form-item'>
                <Text className='item-label'>发行日期</Text>
                <Picker
                  mode='date'
                  value={formData.releaseDate}
                  onChange={(e) => updateField('releaseDate', e.detail.value)}
                >
                  <View className='item-picker'>
                    <Text className={formData.releaseDate ? '' : 'placeholder'}>
                      {formData.releaseDate || '选择日期'}
                    </Text>
                    <Text className='picker-arrow'>›</Text>
                  </View>
                </Picker>
              </View>
              
              <View className='form-item'>
                <Text className='item-label'>条形码</Text>
                <Input
                  className='item-input'
                  placeholder='选填'
                  value={formData.barcode}
                  onInput={(e) => updateField('barcode', e.detail.value)}
                />
              </View>
              
              <View className='form-item'>
                <Text className='item-label'>音乐流派</Text>
                <Input
                  className='item-input'
                  placeholder='多个流派用逗号分隔'
                  value={formData.genre}
                  onInput={(e) => updateField('genre', e.detail.value)}
                />
              </View>
              
              <View className='form-row'>
                <View className='form-item half'>
                  <Text className='item-label'>介质格式</Text>
                  <Picker
                    mode='selector'
                    range={FORMAT_OPTIONS}
                    value={FORMAT_OPTIONS.indexOf(formData.format)}
                    onChange={(e) => updateField('format', FORMAT_OPTIONS[e.detail.value as number])}
                  >
                    <View className='item-picker'>
                      <Text className={formData.format ? '' : 'placeholder'}>
                        {formData.format || '选择'}
                      </Text>
                      <Text className='picker-arrow'>›</Text>
                    </View>
                  </Picker>
                </View>
                
                <View className='form-item half'>
                  <Text className='item-label'>曲目数</Text>
                  <Input
                    className='item-input'
                    type='number'
                    placeholder='选填'
                    value={formData.trackCount}
                    onInput={(e) => updateField('trackCount', e.detail.value)}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* 购买信息 */}
        <View className='form-section'>
          <Text className='section-title'>购买信息</Text>
          
          <View className='form-row'>
            <View className='form-item flex-2'>
              <Text className='item-label'>购买价格</Text>
              <View className='price-input'>
                <Text className='currency-symbol'>{CURRENCY_SYMBOL[formData.currency]}</Text>
                <Input
                  className='item-input'
                  type='digit'
                  placeholder='0.00'
                  value={formData.purchasePrice}
                  onInput={(e) => updateField('purchasePrice', e.detail.value)}
                />
              </View>
            </View>
            
            <View className='form-item flex-1'>
              <Text className='item-label'>货币</Text>
              <Picker
                mode='selector'
                range={CURRENCY_OPTIONS}
                value={CURRENCY_OPTIONS.indexOf(formData.currency)}
                onChange={(e) => updateField('currency', CURRENCY_OPTIONS[e.detail.value as number] as Currency)}
              >
                <View className='item-picker'>
                  <Text>{formData.currency}</Text>
                  <Text className='picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>

        {/* 备注 */}
        <View className='form-section'>
          <Text className='section-title'>备注</Text>
          <Textarea
            className='notes-input'
            placeholder='添加一些备注信息...'
            value={formData.notes}
            onInput={(e) => updateField('notes', e.detail.value)}
            maxlength={500}
          />
        </View>

        {/* 占位 */}
        <View style={{ height: '160rpx' }} />
      </ScrollView>

      {/* 提交按钮 */}
      <View className='submit-bar'>
        <View
          className={`submit-btn ${submitting ? 'loading' : ''}`}
          onClick={!submitting ? handleSubmit : undefined}
        >
          <Text>{submitting ? '添加中...' : '添加到书房'}</Text>
        </View>
      </View>
    </View>
  )
}
