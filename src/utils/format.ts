/**
 * 格式化工具函数
 */
import type { Currency } from '../types'
import { CURRENCY_SYMBOL } from '../types'

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number | undefined,
  format = 'YYYY-MM-DD'
): string {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  
  if (years > 0) return `${years}年前`
  if (months > 0) return `${months}个月前`
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

/**
 * 格式化价格（不含货币符号）
 */
export function formatPrice(
  price: number | undefined | null
): string {
  if (price === undefined || price === null) return '0.00'
  return price.toFixed(2)
}

/**
 * 格式化价格（含货币符号）
 */
export function formatPriceWithCurrency(
  price: number | undefined | null,
  currency: Currency = 'CNY'
): string {
  if (price === undefined || price === null) return ''
  
  const symbol = CURRENCY_SYMBOL[currency] || '¥'
  return `${symbol}${price.toFixed(2)}`
}

/**
 * 格式化数量
 */
export function formatCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}千`
  }
  return String(count)
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * 格式化作者列表
 */
export function formatAuthors(authors: string[] | undefined): string {
  if (!authors || authors.length === 0) return '未知作者'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return authors.join('、')
  return `${authors[0]} 等`
}

/**
 * 格式化 ISBN
 */
export function formatISBN(isbn: string): string {
  if (!isbn) return ''
  
  // ISBN-13: xxx-x-xxxx-xxxx-x
  if (isbn.length === 13) {
    return `${isbn.slice(0, 3)}-${isbn[3]}-${isbn.slice(4, 8)}-${isbn.slice(8, 12)}-${isbn[12]}`
  }
  
  // ISBN-10: x-xxxx-xxxx-x
  if (isbn.length === 10) {
    return `${isbn[0]}-${isbn.slice(1, 5)}-${isbn.slice(5, 9)}-${isbn[9]}`
  }
  
  return isbn
}
