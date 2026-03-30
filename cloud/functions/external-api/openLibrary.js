/**
 * Open Library API 封装
 * 文档：https://openlibrary.org/developers/api
 */
const axios = require('axios')

const BASE_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org'

/**
 * 通过 ISBN 搜索
 */
async function searchByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}.json`, {
      timeout: 5000
    })
    
    if (!response.data) return null
    
    const book = response.data
    
    // 获取作者信息
    let authors = []
    if (book.authors && book.authors.length > 0) {
      const authorPromises = book.authors.map(async (author) => {
        try {
          const authorRes = await axios.get(`${BASE_URL}${author.key}.json`, {
            timeout: 3000
          })
          return authorRes.data?.name || ''
        } catch {
          return ''
        }
      })
      authors = (await Promise.all(authorPromises)).filter(Boolean)
    }
    
    // 构建封面 URL
    let coverUrl = ''
    if (book.covers && book.covers.length > 0) {
      coverUrl = `${COVERS_URL}/b/id/${book.covers[0]}-L.jpg`
    } else {
      coverUrl = `${COVERS_URL}/b/isbn/${isbn}-L.jpg`
    }
    
    return {
      title: book.title || '',
      subtitle: book.subtitle || '',
      authors,
      publisher: book.publishers?.[0] || '',
      publishDate: book.publish_date || '',
      isbn: isbn,
      coverUrl,
      pages: book.number_of_pages || null,
      language: book.languages?.[0]?.key?.replace('/languages/', '') || '',
      description: typeof book.description === 'string' 
        ? book.description 
        : book.description?.value || ''
    }
  } catch (err) {
    console.error('Open Library ISBN search error:', err.message)
    return null
  }
}

/**
 * 通过关键词搜索
 */
async function searchByKeyword(keyword, limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/search.json`, {
      params: {
        q: keyword,
        limit,
        fields: 'key,title,author_name,publisher,first_publish_year,isbn,cover_i,number_of_pages_median,language'
      },
      timeout: 8000
    })
    
    if (!response.data?.docs) return []
    
    return response.data.docs.map(book => ({
      title: book.title || '',
      subtitle: '',
      authors: book.author_name || [],
      publisher: book.publisher?.[0] || '',
      publishDate: book.first_publish_year?.toString() || '',
      isbn: book.isbn?.[0] || '',
      coverUrl: book.cover_i 
        ? `${COVERS_URL}/b/id/${book.cover_i}-L.jpg`
        : '',
      pages: book.number_of_pages_median || null,
      language: book.language?.[0] || ''
    }))
  } catch (err) {
    console.error('Open Library keyword search error:', err.message)
    return []
  }
}

module.exports = {
  searchByISBN,
  searchByKeyword
}
