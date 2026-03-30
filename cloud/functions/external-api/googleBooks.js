/**
 * Google Books API 封装
 * 文档：https://developers.google.com/books/docs/v1/using
 */
const axios = require('axios')

const BASE_URL = 'https://www.googleapis.com/books/v1'

// API Key（可选，不配置也能用，但有限流）
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY || ''

/**
 * 通过 ISBN 搜索
 */
async function searchByISBN(isbn) {
  try {
    const params = { q: `isbn:${isbn}` }
    if (API_KEY) params.key = API_KEY
    
    const response = await axios.get(`${BASE_URL}/volumes`, {
      params,
      timeout: 8000
    })
    
    if (!response.data?.items || response.data.items.length === 0) {
      return null
    }
    
    const book = response.data.items[0].volumeInfo
    
    return {
      title: book.title || '',
      subtitle: book.subtitle || '',
      authors: book.authors || [],
      publisher: book.publisher || '',
      publishDate: book.publishedDate || '',
      isbn: isbn,
      coverUrl: book.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      pages: book.pageCount || null,
      language: book.language || '',
      description: book.description || ''
    }
  } catch (err) {
    console.error('Google Books ISBN search error:', err.message)
    return null
  }
}

/**
 * 通过关键词搜索
 */
async function searchByKeyword(keyword, limit = 10) {
  try {
    const params = {
      q: keyword,
      maxResults: limit,
      printType: 'books',
      langRestrict: 'zh'  // 优先中文
    }
    if (API_KEY) params.key = API_KEY
    
    const response = await axios.get(`${BASE_URL}/volumes`, {
      params,
      timeout: 8000
    })
    
    if (!response.data?.items) return []
    
    return response.data.items.map(item => {
      const book = item.volumeInfo
      const industryIds = book.industryIdentifiers || []
      const isbn = industryIds.find(id => id.type === 'ISBN_13')?.identifier ||
                   industryIds.find(id => id.type === 'ISBN_10')?.identifier || ''
      
      return {
        title: book.title || '',
        subtitle: book.subtitle || '',
        authors: book.authors || [],
        publisher: book.publisher || '',
        publishDate: book.publishedDate || '',
        isbn,
        coverUrl: book.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        pages: book.pageCount || null,
        language: book.language || ''
      }
    })
  } catch (err) {
    console.error('Google Books keyword search error:', err.message)
    return []
  }
}

module.exports = {
  searchByISBN,
  searchByKeyword
}
