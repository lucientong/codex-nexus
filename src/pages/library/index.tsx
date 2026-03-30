/**
 * 书房详情页 - 藏品展示
 * 设计理念：拟物化书架 + 现代列表，双视图切换
 */
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useLoad, useRouter, usePullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback, useMemo } from 'react'
import { useLibraryStore, useItemStore } from '../../stores'
import { ITEM_TYPES, QUICK_SORT_OPTIONS } from '../../constants'
import { formatPrice, formatAuthors } from '../../utils'
import type { Item, ItemType, SortField, SortOrder } from '../../types'
import './index.scss'

// 视图模式类型
type ViewMode = 'shelf' | 'list'

// 藏品封面组件（用于书架视图）
function ItemCover({ item, onClick }: { item: Item; onClick: () => void }) {
  const isBook = item.type === 'book' || item.type === 'magazine'
  const isVinyl = item.type === 'vinyl'
  const isCD = item.type === 'cd'
  
  return (
    <View 
      className={`item-cover ${item.type}-cover`} 
      onClick={onClick}
    >
      {item.coverUrl ? (
        <Image 
          className='cover-image' 
          src={item.coverUrl} 
          mode='aspectFill'
          lazyLoad
        />
      ) : (
        <View className='cover-placeholder'>
          <Text className='placeholder-text text-ellipsis'>
            {item.title.slice(0, 4)}
          </Text>
        </View>
      )}
      
      {/* 书籍 3D 效果 */}
      {isBook && (
        <>
          <View className='book-spine' />
          <View className='book-pages' />
        </>
      )}
      
      {/* 黑胶唱片效果 */}
      {isVinyl && (
        <View className='vinyl-disc'>
          <View className='disc-label' />
          <View className='disc-grooves' />
        </View>
      )}
      
      {/* CD 光盘效果 */}
      {isCD && (
        <View className='cd-disc'>
          <View className='cd-center' />
          <View className='cd-rainbow' />
        </View>
      )}
    </View>
  )
}

// 书架组件
function Bookshelf({ items, onItemClick }: { items: Item[]; onItemClick: (item: Item) => void }) {
  // 按类型分组
  const groupedItems = useMemo(() => {
    const groups: Record<ItemType, Item[]> = {
      book: [],
      cd: [],
      vinyl: [],
      dvd: [],
      magazine: []
    }
    
    items.forEach(item => {
      if (groups[item.type]) {
        groups[item.type].push(item)
      }
    })
    
    return groups
  }, [items])
  
  // 每层书架放置的数量
  const itemsPerShelf = 5
  
  // 生成书架层
  const renderShelfRows = (typeItems: Item[], type: ItemType) => {
    const rows: Item[][] = []
    for (let i = 0; i < typeItems.length; i += itemsPerShelf) {
      rows.push(typeItems.slice(i, i + itemsPerShelf))
    }
    return rows
  }
  
  // 获取类型标签
  const getTypeLabel = (type: ItemType) => {
    const found = ITEM_TYPES.find(t => t.value === type)
    return found?.label || type
  }
  
  return (
    <View className='bookshelf'>
      {/* 图书区域 */}
      {groupedItems.book.length > 0 && (
        <View className='shelf-section'>
          <View className='section-header'>
            <Text className='section-title'>{getTypeLabel('book')}</Text>
            <Text className='section-count'>{groupedItems.book.length}</Text>
          </View>
          {renderShelfRows(groupedItems.book, 'book').map((row, rowIndex) => (
            <View key={rowIndex} className='shelf-row book-shelf'>
              <View className='shelf-items'>
                {row.map((item) => (
                  <ItemCover 
                    key={item._id} 
                    item={item} 
                    onClick={() => onItemClick(item)}
                  />
                ))}
              </View>
              <View className='shelf-board'>
                <View className='board-surface' />
                <View className='board-edge' />
              </View>
            </View>
          ))}
        </View>
      )}
      
      {/* 黑胶/CD 区域 */}
      {(groupedItems.vinyl.length > 0 || groupedItems.cd.length > 0) && (
        <View className='shelf-section'>
          <View className='section-header'>
            <Text className='section-title'>音乐收藏</Text>
            <Text className='section-count'>
              {groupedItems.vinyl.length + groupedItems.cd.length}
            </Text>
          </View>
          {renderShelfRows([...groupedItems.vinyl, ...groupedItems.cd], 'vinyl').map((row, rowIndex) => (
            <View key={rowIndex} className='shelf-row vinyl-shelf'>
              <View className='shelf-items'>
                {row.map((item) => (
                  <ItemCover 
                    key={item._id} 
                    item={item} 
                    onClick={() => onItemClick(item)}
                  />
                ))}
              </View>
              <View className='shelf-board vinyl-board'>
                <View className='board-surface' />
              </View>
            </View>
          ))}
        </View>
      )}
      
      {/* DVD 区域 */}
      {groupedItems.dvd.length > 0 && (
        <View className='shelf-section'>
          <View className='section-header'>
            <Text className='section-title'>{getTypeLabel('dvd')}</Text>
            <Text className='section-count'>{groupedItems.dvd.length}</Text>
          </View>
          {renderShelfRows(groupedItems.dvd, 'dvd').map((row, rowIndex) => (
            <View key={rowIndex} className='shelf-row dvd-shelf'>
              <View className='shelf-items'>
                {row.map((item) => (
                  <ItemCover 
                    key={item._id} 
                    item={item} 
                    onClick={() => onItemClick(item)}
                  />
                ))}
              </View>
              <View className='shelf-board'>
                <View className='board-surface' />
                <View className='board-edge' />
              </View>
            </View>
          ))}
        </View>
      )}
      
      {/* 杂志区域 */}
      {groupedItems.magazine.length > 0 && (
        <View className='shelf-section'>
          <View className='section-header'>
            <Text className='section-title'>{getTypeLabel('magazine')}</Text>
            <Text className='section-count'>{groupedItems.magazine.length}</Text>
          </View>
          {renderShelfRows(groupedItems.magazine, 'magazine').map((row, rowIndex) => (
            <View key={rowIndex} className='shelf-row magazine-shelf'>
              <View className='shelf-items'>
                {row.map((item) => (
                  <ItemCover 
                    key={item._id} 
                    item={item} 
                    onClick={() => onItemClick(item)}
                  />
                ))}
              </View>
              <View className='shelf-board'>
                <View className='board-surface' />
                <View className='board-edge' />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// 列表项组件
function ListItem({ item, onClick }: { item: Item; onClick: () => void }) {
  const typeConfig = ITEM_TYPES.find(t => t.value === item.type)
  
  // 获取创作者（作者/艺术家）
  const getCreator = () => {
    if (item.type === 'book' || item.type === 'magazine') {
      const bookItem = item as any
      return formatAuthors(bookItem.extraFields?.authors)
    }
    if (item.type === 'cd' || item.type === 'vinyl') {
      const musicItem = item as any
      return musicItem.extraFields?.artist || '未知艺术家'
    }
    return ''
  }
  
  return (
    <View className='list-item' onClick={onClick}>
      <View className='item-cover-wrapper'>
        {item.coverUrl ? (
          <Image 
            className='item-cover' 
            src={item.coverUrl} 
            mode='aspectFill'
            lazyLoad
          />
        ) : (
          <View className='cover-placeholder'>
            <Text className='placeholder-icon'>📚</Text>
          </View>
        )}
      </View>
      
      <View className='item-info'>
        <Text className='item-title text-ellipsis'>{item.title}</Text>
        <Text className='item-creator text-ellipsis'>{getCreator()}</Text>
        <View className='item-meta'>
          <View 
            className='type-tag' 
            style={{ backgroundColor: `${typeConfig?.color}20`, color: typeConfig?.color }}
          >
            <Text>{typeConfig?.label}</Text>
          </View>
          {item.purchasePrice && (
            <Text className='item-price'>
              {formatPrice(item.purchasePrice, item.currency)}
            </Text>
          )}
        </View>
      </View>
      
      <View className='item-arrow'>
        <Text className='arrow-icon'>›</Text>
      </View>
    </View>
  )
}

// 列表视图组件
function ListView({ items, onItemClick }: { items: Item[]; onItemClick: (item: Item) => void }) {
  return (
    <View className='list-view'>
      {items.map((item, index) => (
        <View key={item._id} className='animate-slideUp' style={{ animationDelay: `${index * 0.03}s` }}>
          <ListItem item={item} onClick={() => onItemClick(item)} />
        </View>
      ))}
    </View>
  )
}

// 排序弹窗
function SortPopup({ 
  visible, 
  currentSort,
  onClose, 
  onSelect 
}: { 
  visible: boolean
  currentSort: { field: string; order: SortOrder }
  onClose: () => void
  onSelect: (field: SortField, order: SortOrder) => void
}) {
  if (!visible) return null
  
  return (
    <View className='popup-overlay' onClick={onClose}>
      <View className='popup-content sort-popup animate-slideUp' onClick={e => e.stopPropagation()}>
        <View className='popup-header'>
          <Text className='popup-title'>排序方式</Text>
        </View>
        <View className='popup-body'>
          {QUICK_SORT_OPTIONS.map((option, index) => {
            const isActive = currentSort.field === option.field && currentSort.order === option.order
            return (
              <View 
                key={index}
                className={`sort-option ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelect(option.field as SortField, option.order)
                  onClose()
                }}
              >
                <Text className='option-label'>{option.label}</Text>
                {isActive && <Text className='option-check'>✓</Text>}
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

// 筛选弹窗
function FilterPopup({ 
  visible, 
  currentType,
  onClose, 
  onSelect 
}: { 
  visible: boolean
  currentType: ItemType | null
  onClose: () => void
  onSelect: (type: ItemType | null) => void
}) {
  if (!visible) return null
  
  return (
    <View className='popup-overlay' onClick={onClose}>
      <View className='popup-content filter-popup animate-slideUp' onClick={e => e.stopPropagation()}>
        <View className='popup-header'>
          <Text className='popup-title'>筛选类型</Text>
        </View>
        <View className='popup-body'>
          <View 
            className={`filter-option ${currentType === null ? 'active' : ''}`}
            onClick={() => {
              onSelect(null)
              onClose()
            }}
          >
            <Text className='option-label'>全部</Text>
            {currentType === null && <Text className='option-check'>✓</Text>}
          </View>
          {ITEM_TYPES.map((type) => (
            <View 
              key={type.value}
              className={`filter-option ${currentType === type.value ? 'active' : ''}`}
              onClick={() => {
                onSelect(type.value)
                onClose()
              }}
            >
              <View className='option-color' style={{ backgroundColor: type.color }} />
              <Text className='option-label'>{type.label}</Text>
              {currentType === type.value && <Text className='option-check'>✓</Text>}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default function Library() {
  const router = useRouter()
  const libraryId = router.params.id || ''
  
  const { currentLibrary, fetchLibrary } = useLibraryStore()
  const { 
    items, 
    loading, 
    searchParams,
    fetchItems, 
    setSearchParams,
    clearItems 
  } = useItemStore()
  
  const [viewMode, setViewMode] = useState<ViewMode>('shelf')
  const [showSortPopup, setShowSortPopup] = useState(false)
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  
  // 页面加载
  useLoad(async () => {
    if (libraryId) {
      await fetchLibrary(libraryId)
      setSearchParams({ libraryId })
      await fetchItems(true)
    }
  })
  
  // 下拉刷新
  usePullDownRefresh(async () => {
    await fetchItems(true)
    stopPullDownRefresh()
  })
  
  // 跳转到藏品详情
  const handleItemClick = useCallback((item: Item) => {
    Taro.navigateTo({
      url: `/pages/item-detail/index?id=${item._id}`
    })
  }, [])
  
  // 跳转到录入页
  const handleAddItem = useCallback(() => {
    Taro.navigateTo({
      url: `/pages/add-item/index?libraryId=${libraryId}`
    })
  }, [libraryId])
  
  // 处理排序
  const handleSort = useCallback((field: SortField, order: SortOrder) => {
    setSearchParams({ sortBy: field, sortOrder: order })
    fetchItems(true)
  }, [setSearchParams, fetchItems])
  
  // 处理筛选
  const handleFilter = useCallback((type: ItemType | null) => {
    setSearchParams({ type: type || undefined })
    fetchItems(true)
  }, [setSearchParams, fetchItems])
  
  // 设置导航栏标题
  if (currentLibrary) {
    Taro.setNavigationBarTitle({ title: currentLibrary.name })
  }
  
  return (
    <View className='library-page'>
      {/* 工具栏 */}
      <View className='toolbar'>
        <View className='toolbar-left'>
          <View 
            className={`view-switch ${viewMode === 'shelf' ? 'active' : ''}`}
            onClick={() => setViewMode('shelf')}
          >
            <Text className='switch-icon'>📚</Text>
            <Text className='switch-label'>书架</Text>
          </View>
          <View 
            className={`view-switch ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <Text className='switch-icon'>☰</Text>
            <Text className='switch-label'>列表</Text>
          </View>
        </View>
        
        <View className='toolbar-right'>
          <View className='tool-btn' onClick={() => setShowFilterPopup(true)}>
            <Text className='btn-icon'>⚙</Text>
            <Text className='btn-label'>筛选</Text>
          </View>
          <View className='tool-btn' onClick={() => setShowSortPopup(true)}>
            <Text className='btn-icon'>↕</Text>
            <Text className='btn-label'>排序</Text>
          </View>
        </View>
      </View>
      
      {/* 统计信息 */}
      {currentLibrary && (
        <View className='stats-bar'>
          <Text className='stats-text'>
            共 {currentLibrary.itemCount} 件藏品
            {searchParams.type && ` · ${ITEM_TYPES.find(t => t.value === searchParams.type)?.label || ''}`}
          </Text>
        </View>
      )}
      
      {/* 内容区域 */}
      <ScrollView 
        className='content-area' 
        scrollY 
        enhanced
        showScrollbar={false}
      >
        {loading && items.length === 0 ? (
          <View className='loading-state'>
            <View className='loading-spinner' />
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : items.length === 0 ? (
          <View className='empty-state'>
            <View className='empty-icon'>📭</View>
            <Text className='empty-title'>还没有藏品</Text>
            <Text className='empty-desc'>扫描条形码或手动录入你的第一件藏品</Text>
            <View className='btn btn-primary' onClick={handleAddItem}>
              <Text>添加藏品</Text>
            </View>
          </View>
        ) : viewMode === 'shelf' ? (
          <Bookshelf items={items} onItemClick={handleItemClick} />
        ) : (
          <ListView items={items} onItemClick={handleItemClick} />
        )}
      </ScrollView>
      
      {/* 悬浮添加按钮 */}
      {items.length > 0 && (
        <View className='fab-button' onClick={handleAddItem}>
          <Text className='fab-icon'>+</Text>
        </View>
      )}
      
      {/* 排序弹窗 */}
      <SortPopup
        visible={showSortPopup}
        currentSort={{ 
          field: searchParams.sortBy || 'createdAt', 
          order: searchParams.sortOrder || 'desc' 
        }}
        onClose={() => setShowSortPopup(false)}
        onSelect={handleSort}
      />
      
      {/* 筛选弹窗 */}
      <FilterPopup
        visible={showFilterPopup}
        currentType={searchParams.type || null}
        onClose={() => setShowFilterPopup(false)}
        onSelect={handleFilter}
      />
    </View>
  )
}
