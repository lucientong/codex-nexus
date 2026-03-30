/**
 * Discogs API 封装
 * 文档：https://www.discogs.com/developers
 */
const axios = require('axios')

const BASE_URL = 'https://api.discogs.com'

// Discogs API 凭证（需要在 Discogs 注册开发者账号获取）
const CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY || ''
const CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET || ''

// 构建请求头
function getHeaders() {
  const headers = {
    'User-Agent': 'CodexNexus/1.0 +https://github.com/codex-nexus'
  }
  
  if (CONSUMER_KEY && CONSUMER_SECRET) {
    headers['Authorization'] = `Discogs key=${CONSUMER_KEY}, secret=${CONSUMER_SECRET}`
  }
  
  return headers
}

/**
 * 通过条形码搜索
 */
async function searchByBarcode(barcode) {
  try {
    const response = await axios.get(`${BASE_URL}/database/search`, {
      params: {
        barcode,
        type: 'release'
      },
      headers: getHeaders(),
      timeout: 8000
    })
    
    if (!response.data?.results || response.data.results.length === 0) {
      return null
    }
    
    const release = response.data.results[0]
    
    // 获取详细信息
    let details = {}
    if (release.id) {
      try {
        const detailRes = await axios.get(`${BASE_URL}/releases/${release.id}`, {
          headers: getHeaders(),
          timeout: 5000
        })
        details = detailRes.data || {}
      } catch {
        // 忽略详情获取失败
      }
    }
    
    return {
      title: release.title || '',
      artist: release.title?.split(' - ')[0] || '',
      label: details.labels?.[0]?.name || release.label?.[0] || '',
      releaseDate: details.released || release.year?.toString() || '',
      barcode,
      coverUrl: release.cover_image || release.thumb || '',
      genre: details.genres || release.genre || [],
      format: details.formats?.[0]?.name || release.format?.[0] || '',
      trackCount: details.tracklist?.length || null,
      discCount: details.formats?.[0]?.qty ? parseInt(details.formats[0].qty) : null,
      catalogNumber: details.labels?.[0]?.catno || ''
    }
  } catch (err) {
    console.error('Discogs barcode search error:', err.message)
    return null
  }
}

/**
 * 通过关键词搜索
 */
async function searchByKeyword(keyword, limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/database/search`, {
      params: {
        q: keyword,
        type: 'release',
        per_page: limit
      },
      headers: getHeaders(),
      timeout: 8000
    })
    
    if (!response.data?.results) return []
    
    return response.data.results.map(release => {
      // 解析艺术家和标题
      const titleParts = release.title?.split(' - ') || []
      const artist = titleParts[0] || ''
      const title = titleParts.slice(1).join(' - ') || release.title || ''
      
      return {
        title,
        artist,
        label: release.label?.[0] || '',
        releaseDate: release.year?.toString() || '',
        barcode: release.barcode?.[0] || '',
        coverUrl: release.cover_image || release.thumb || '',
        genre: release.genre || [],
        format: release.format?.[0] || ''
      }
    })
  } catch (err) {
    console.error('Discogs keyword search error:', err.message)
    return []
  }
}

module.exports = {
  searchByBarcode,
  searchByKeyword
}
