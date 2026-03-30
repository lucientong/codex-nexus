/**
 * 外部 API 服务云函数
 * 统一调用外部数据源：Open Library、Google Books、Discogs、MusicBrainz、豆瓣
 */
const cloud = require('wx-server-sdk')
const openLibrary = require('./openLibrary')
const googleBooks = require('./googleBooks')
const discogs = require('./discogs')
const musicbrainz = require('./musicbrainz')
const douban = require('./douban')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 通过 ISBN 搜索图书
 * 级联查询：Open Library → Google Books → 豆瓣
 */
async function searchBookByISBN(isbn) {
  // 清理 ISBN（移除连字符）
  const cleanISBN = isbn.replace(/-/g, '')
  
  // 尝试 Open Library
  try {
    const openLibResult = await openLibrary.searchByISBN(cleanISBN)
    if (openLibResult) {
      return {
        success: true,
        data: openLibResult,
        source: 'openlibrary'
      }
    }
  } catch (err) {
    console.log('Open Library search failed:', err.message)
  }
  
  // 尝试 Google Books
  try {
    const googleResult = await googleBooks.searchByISBN(cleanISBN)
    if (googleResult) {
      return {
        success: true,
        data: googleResult,
        source: 'googlebooks'
      }
    }
  } catch (err) {
    console.log('Google Books search failed:', err.message)
  }
  
  // 尝试豆瓣爬虫
  try {
    const doubanResult = await douban.searchByISBN(cleanISBN)
    if (doubanResult) {
      return {
        success: true,
        data: doubanResult,
        source: 'douban'
      }
    }
  } catch (err) {
    console.log('Douban search failed:', err.message)
  }
  
  return {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '未找到该图书信息'
    }
  }
}

/**
 * 通过关键词搜索图书
 */
async function searchBookByKeyword(keyword, limit = 10) {
  const results = []
  
  // 并行搜索多个数据源
  const [openLibResults, googleResults] = await Promise.allSettled([
    openLibrary.searchByKeyword(keyword, limit),
    googleBooks.searchByKeyword(keyword, limit)
  ])
  
  if (openLibResults.status === 'fulfilled' && openLibResults.value) {
    results.push(...openLibResults.value.map(item => ({ ...item, source: 'openlibrary' })))
  }
  
  if (googleResults.status === 'fulfilled' && googleResults.value) {
    results.push(...googleResults.value.map(item => ({ ...item, source: 'googlebooks' })))
  }
  
  // 去重（根据 ISBN 或标题）
  const uniqueResults = []
  const seen = new Set()
  
  for (const item of results) {
    const key = item.isbn || item.title.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueResults.push(item)
    }
  }
  
  return {
    success: true,
    data: uniqueResults.slice(0, limit)
  }
}

/**
 * 通过条形码搜索音乐
 * 级联查询：Discogs → MusicBrainz
 */
async function searchMusicByBarcode(barcode) {
  // 尝试 Discogs
  try {
    const discogsResult = await discogs.searchByBarcode(barcode)
    if (discogsResult) {
      return {
        success: true,
        data: discogsResult,
        source: 'discogs'
      }
    }
  } catch (err) {
    console.log('Discogs search failed:', err.message)
  }
  
  // 尝试 MusicBrainz
  try {
    const mbResult = await musicbrainz.searchByBarcode(barcode)
    if (mbResult) {
      return {
        success: true,
        data: mbResult,
        source: 'musicbrainz'
      }
    }
  } catch (err) {
    console.log('MusicBrainz search failed:', err.message)
  }
  
  return {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '未找到该音乐专辑信息'
    }
  }
}

/**
 * 通过关键词搜索音乐
 */
async function searchMusicByKeyword(keyword, limit = 10) {
  const results = []
  
  // 并行搜索
  const [discogsResults, mbResults] = await Promise.allSettled([
    discogs.searchByKeyword(keyword, limit),
    musicbrainz.searchByKeyword(keyword, limit)
  ])
  
  if (discogsResults.status === 'fulfilled' && discogsResults.value) {
    results.push(...discogsResults.value.map(item => ({ ...item, source: 'discogs' })))
  }
  
  if (mbResults.status === 'fulfilled' && mbResults.value) {
    results.push(...mbResults.value.map(item => ({ ...item, source: 'musicbrainz' })))
  }
  
  // 去重
  const uniqueResults = []
  const seen = new Set()
  
  for (const item of results) {
    const key = item.barcode || `${item.artist}-${item.title}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueResults.push(item)
    }
  }
  
  return {
    success: true,
    data: uniqueResults.slice(0, limit)
  }
}

// 云函数入口
exports.main = async (event, context) => {
  const { action, ...params } = event
  
  switch (action) {
    case 'searchBookByISBN':
      return searchBookByISBN(params.isbn)
    
    case 'searchBookByKeyword':
      return searchBookByKeyword(params.keyword, params.limit)
    
    case 'searchMusicByBarcode':
      return searchMusicByBarcode(params.barcode)
    
    case 'searchMusicByKeyword':
      return searchMusicByKeyword(params.keyword, params.limit)
    
    default:
      return {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: '无效的操作'
        }
      }
  }
}
