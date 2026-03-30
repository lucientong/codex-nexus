/**
 * 豆瓣图书爬虫
 * 注意：爬虫仅作为备选方案，需要控制请求频率
 */
const axios = require('axios')
const cheerio = require('cheerio')

const BASE_URL = 'https://book.douban.com'
const SEARCH_URL = 'https://search.douban.com/book/subject_search'

// 模拟浏览器请求头
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Referer': 'https://book.douban.com/'
}

/**
 * 通过 ISBN 搜索
 */
async function searchByISBN(isbn) {
  try {
    // 搜索页面
    const searchResponse = await axios.get(SEARCH_URL, {
      params: {
        search_text: isbn,
        cat: 1001
      },
      headers: HEADERS,
      timeout: 10000
    })
    
    // 解析搜索结果
    const $ = cheerio.load(searchResponse.data)
    const firstResult = $('.item-root').first()
    
    if (firstResult.length === 0) {
      return null
    }
    
    // 获取书籍详情页链接
    const detailUrl = firstResult.find('a').first().attr('href')
    
    if (!detailUrl) {
      return null
    }
    
    // 访问详情页
    const detailResponse = await axios.get(detailUrl, {
      headers: HEADERS,
      timeout: 10000
    })
    
    const $detail = cheerio.load(detailResponse.data)
    
    // 解析基本信息
    const title = $detail('h1 span').first().text().trim()
    const subtitle = $detail('#info span.pl:contains("副标题")').next().text().trim()
    const coverUrl = $detail('#mainpic img').attr('src') || ''
    
    // 解析作者
    const authorsText = $detail('#info span.pl:contains("作者")').parent().text()
    const authors = authorsText
      .replace('作者:', '')
      .split('/')
      .map(a => a.trim())
      .filter(Boolean)
    
    // 解析出版社
    const publisher = $detail('#info span.pl:contains("出版社")').next().text().trim()
    
    // 解析出版日期
    const publishDate = $detail('#info span.pl:contains("出版年")').next().text().trim()
    
    // 解析页数
    const pagesText = $detail('#info span.pl:contains("页数")').next().text().trim()
    const pages = pagesText ? parseInt(pagesText) : null
    
    // 解析简介
    const description = $detail('#link-report .intro p').first().text().trim()
    
    return {
      title,
      subtitle,
      authors,
      publisher,
      publishDate,
      isbn,
      coverUrl: coverUrl.replace('s_ratio_poster', 'l'),  // 获取大图
      pages,
      language: 'zh',
      description
    }
  } catch (err) {
    console.error('Douban search error:', err.message)
    return null
  }
}

module.exports = {
  searchByISBN
}
