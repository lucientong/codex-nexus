/**
 * MusicBrainz API 封装
 * 文档：https://musicbrainz.org/doc/MusicBrainz_API
 */
const axios = require('axios')

const BASE_URL = 'https://musicbrainz.org/ws/2'
const COVER_ART_URL = 'https://coverartarchive.org'

// MusicBrainz 要求标识 User-Agent
const USER_AGENT = 'CodexNexus/1.0 (contact@example.com)'

/**
 * 通过条形码搜索
 */
async function searchByBarcode(barcode) {
  try {
    const response = await axios.get(`${BASE_URL}/release`, {
      params: {
        query: `barcode:${barcode}`,
        fmt: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': USER_AGENT
      },
      timeout: 8000
    })
    
    if (!response.data?.releases || response.data.releases.length === 0) {
      return null
    }
    
    const release = response.data.releases[0]
    
    // 尝试获取封面
    let coverUrl = ''
    try {
      const coverRes = await axios.get(`${COVER_ART_URL}/release/${release.id}`, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 3000
      })
      if (coverRes.data?.images?.[0]) {
        coverUrl = coverRes.data.images[0].thumbnails?.large || 
                   coverRes.data.images[0].image || ''
      }
    } catch {
      // 封面获取失败，忽略
    }
    
    // 获取艺术家
    const artist = release['artist-credit']?.[0]?.name || 
                   release['artist-credit']?.[0]?.artist?.name || ''
    
    return {
      title: release.title || '',
      artist,
      label: release['label-info']?.[0]?.label?.name || '',
      releaseDate: release.date || '',
      barcode,
      coverUrl,
      genre: [],  // MusicBrainz 的流派信息需要额外 API 调用
      format: release.media?.[0]?.format || '',
      trackCount: release.media?.[0]?.['track-count'] || null,
      discCount: release.media?.length || null,
      catalogNumber: release['label-info']?.[0]?.['catalog-number'] || ''
    }
  } catch (err) {
    console.error('MusicBrainz barcode search error:', err.message)
    return null
  }
}

/**
 * 通过关键词搜索
 */
async function searchByKeyword(keyword, limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/release`, {
      params: {
        query: keyword,
        fmt: 'json',
        limit
      },
      headers: {
        'User-Agent': USER_AGENT
      },
      timeout: 8000
    })
    
    if (!response.data?.releases) return []
    
    return response.data.releases.map(release => {
      const artist = release['artist-credit']?.[0]?.name || 
                     release['artist-credit']?.[0]?.artist?.name || ''
      
      return {
        title: release.title || '',
        artist,
        label: release['label-info']?.[0]?.label?.name || '',
        releaseDate: release.date || '',
        barcode: release.barcode || '',
        coverUrl: '',  // 批量获取封面太慢，省略
        genre: [],
        format: release.media?.[0]?.format || '',
        trackCount: release.media?.[0]?.['track-count'] || null
      }
    })
  } catch (err) {
    console.error('MusicBrainz keyword search error:', err.message)
    return []
  }
}

module.exports = {
  searchByBarcode,
  searchByKeyword
}
