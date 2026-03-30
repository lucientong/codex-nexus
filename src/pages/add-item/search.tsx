/**
 * 搜索录入页面
 * 支持按标题、作者、ISBN 等关键词搜索外部数据源
 */
import { View, Text, Input, Image, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback, useRef } from 'react'
import { useItemStore } from '../../stores'
import { externalService } from '../../services'
import type { ItemType, CreateItemParams, BookExtraFields, MusicExtraFields } from '../../types'
import './search.scss'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  coverUrl?: string
  creator?: string
  publisher?: string
  year?: string
  identifier?: string
  source: string
  rawData?: Record<string, unknown>
}

export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [searchType, setSearchType] = useState<'title' | 'author' | 'isbn'>('title')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const { createItem, checkDuplicate } = useItemStore()
  
  // 获取路由参数
  const getParams = useCallback(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    return {
      libraryId: params.libraryId || '',
      type: (params.type as ItemType) || 'book'
    }
  }, [])

  // 执行搜索
  const doSearch = useCallback(async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    
    const { type } = getParams()
    setLoading(true)
    setSearched(true)
    
    let searchResults: SearchResult[] = []
    
    if (type === 'book') {
      // 搜索图书
      const params = {
        [searchType]: searchKeyword.trim()
      }
      const res = await externalService.searchBooks(params)
      
      if (res.success && res.data) {
        searchResults = res.data.map((book, index) => ({
          id: `book-${index}-${book.isbn || book.title}`,
          title: book.title,
          subtitle: book.subtitle,
          coverUrl: book.coverUrl,
          creator: book.authors?.join(', '),
          publisher: book.publisher,
          year: book.publishDate,
          identifier: book.isbn,
          source: 'Open Library',
          rawData: book as unknown as Record<string, unknown>
        }))
      }
    } else {
      // 搜索音乐
      const res = await externalService.searchMusic({ query: searchKeyword.trim(), type })
      
      if (res.success && res.data) {
        searchResults = res.data.map((music, index) => ({
          id: `music-${index}-${music.barcode || music.title}`,
          title: music.title,
          coverUrl: music.coverUrl,
          creator: music.artist,
          publisher: music.label,
          year: music.releaseDate,
          identifier: music.barcode,
          source: 'Discogs',
          rawData: music as unknown as Record<string, unknown>
        }))
      }
    }
    
    setResults(searchResults)
    setLoading(false)
  }, [getParams, searchType])

  // 防抖搜索
  const handleInput = useCallback((value: string) => {
    setKeyword(value)
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      doSearch(value)
    }, 500)
  }, [doSearch])

  // 直接搜索
  const handleSearch = useCallback(() => {
    doSearch(keyword)
  }, [doSearch, keyword])

  // 添加搜索结果
  const addItem = useCallback(async (item: SearchResult) => {
    const { libraryId, type } = getParams()
    setAddingId(item.id)
    
    // 检查是否重复
    const duplicateResult = await checkDuplicate({
      type,
      isbn: type === 'book' ? item.identifier : undefined,
      barcode: type !== 'book' ? item.identifier : undefined,
      title: item.title
    })
    
    if (duplicateResult.isDuplicate) {
      Taro.showModal({
        title: '藏品已存在',
        content: '该藏品已在您的书房中，是否仍要添加？',
        confirmText: '继续添加',
        cancelText: '取消'
      }).then(res => {
        if (!res.confirm) {
          setAddingId(null)
          return
        }
        performAdd(item)
      })
      return
    }
    
    await performAdd(item)
  }, [getParams, checkDuplicate])

  // 执行添加
  const performAdd = useCallback(async (item: SearchResult) => {
    const { libraryId, type } = getParams()
    
    const createParams: CreateItemParams = {
      libraryId,
      type,
      title: item.title,
      subtitle: item.subtitle,
      coverUrl: item.coverUrl,
      extraFields: type === 'book'
        ? {
            authors: item.creator?.split(', ') || [],
            publisher: item.publisher,
            publishDate: item.year,
            isbn: item.identifier
          } as BookExtraFields
        : {
            artist: item.creator || '',
            label: item.publisher,
            releaseDate: item.year,
            barcode: item.identifier
          } as MusicExtraFields
    }
    
    const result = await createItem(createParams)
    setAddingId(null)
    
    if (result) {
      Taro.showToast({ title: '添加成功', icon: 'success' })
      // 从结果列表移除
      setResults(prev => prev.filter(r => r.id !== item.id))
    } else {
      Taro.showToast({ title: '添加失败', icon: 'none' })
    }
  }, [getParams, createItem])

  // 跳转手动录入
  const goManual = useCallback((item?: SearchResult) => {
    const { libraryId, type } = getParams()
    let url = `/pages/add-item/manual?libraryId=${libraryId}&type=${type}`
    if (item) {
      url += `&title=${encodeURIComponent(item.title)}`
      if (item.creator) url += `&creator=${encodeURIComponent(item.creator)}`
      if (item.identifier) url += `&code=${encodeURIComponent(item.identifier)}`
    }
    Taro.navigateTo({ url })
  }, [getParams])

  const { type } = getParams()
  const isBook = type === 'book'

  return (
    <View className='search-page'>
      {/* 搜索框 */}
      <View className='search-header'>
        <View className='search-box'>
          <Text className='search-icon'>🔍</Text>
          <Input
            className='search-input'
            placeholder={`搜索${isBook ? '书名、作者或 ISBN' : '专辑名、艺术家'}`}
            value={keyword}
            onInput={(e) => handleInput(e.detail.value)}
            onConfirm={handleSearch}
            confirmType='search'
          />
          {keyword && (
            <Text className='clear-icon' onClick={() => { setKeyword(''); setResults([]); setSearched(false) }}>
              ✕
            </Text>
          )}
        </View>
        
        {/* 搜索类型切换（仅图书） */}
        {isBook && (
          <View className='search-types'>
            {[
              { key: 'title', label: '书名' },
              { key: 'author', label: '作者' },
              { key: 'isbn', label: 'ISBN' }
            ].map(t => (
              <View
                key={t.key}
                className={`type-tab ${searchType === t.key ? 'active' : ''}`}
                onClick={() => setSearchType(t.key as typeof searchType)}
              >
                <Text>{t.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 搜索结果 */}
      <ScrollView className='search-results' scrollY>
        {loading ? (
          <View className='loading-state'>
            <View className='loading-spinner' />
            <Text className='loading-text'>搜索中...</Text>
          </View>
        ) : results.length > 0 ? (
          <View className='results-list'>
            {results.map(item => (
              <View key={item.id} className='result-item'>
                <View className='item-cover'>
                  {item.coverUrl ? (
                    <Image src={item.coverUrl} mode='aspectFill' className='cover-image' />
                  ) : (
                    <View className='cover-placeholder'>
                      <Text className='placeholder-emoji'>{isBook ? '📚' : '💿'}</Text>
                    </View>
                  )}
                </View>
                
                <View className='item-info'>
                  <Text className='item-title'>{item.title}</Text>
                  {item.subtitle && <Text className='item-subtitle'>{item.subtitle}</Text>}
                  {item.creator && <Text className='item-creator'>{item.creator}</Text>}
                  <View className='item-meta'>
                    {item.publisher && <Text className='meta-text'>{item.publisher}</Text>}
                    {item.year && <Text className='meta-text'>{item.year}</Text>}
                  </View>
                  <Text className='item-source'>来源: {item.source}</Text>
                </View>
                
                <View className='item-actions'>
                  <View
                    className={`add-btn ${addingId === item.id ? 'loading' : ''}`}
                    onClick={() => addingId !== item.id && addItem(item)}
                  >
                    <Text>{addingId === item.id ? '...' : '+'}</Text>
                  </View>
                </View>
              </View>
            ))}
            
            {/* 底部提示 */}
            <View className='results-footer'>
              <Text className='footer-text'>没有找到想要的？</Text>
              <View className='manual-link' onClick={() => goManual()}>
                <Text>手动录入</Text>
              </View>
            </View>
          </View>
        ) : searched ? (
          <View className='empty-state'>
            <Text className='empty-icon'>📭</Text>
            <Text className='empty-title'>没有找到相关结果</Text>
            <Text className='empty-desc'>换个关键词试试，或手动录入</Text>
            <View className='empty-action' onClick={() => goManual()}>
              <Text>手动录入</Text>
            </View>
          </View>
        ) : (
          <View className='hint-state'>
            <Text className='hint-icon'>💡</Text>
            <Text className='hint-title'>搜索提示</Text>
            <View className='hint-list'>
              <Text className='hint-item'>• 输入{isBook ? '书名' : '专辑名'}关键词搜索</Text>
              <Text className='hint-item'>• 支持{isBook ? '作者名、ISBN 号' : '艺术家名称'}搜索</Text>
              <Text className='hint-item'>• 搜索结果来自 {isBook ? 'Open Library、Google Books' : 'Discogs、MusicBrainz'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
