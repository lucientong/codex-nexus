/**
 * 验证工具函数
 */

/**
 * 验证 ISBN-10
 */
export function isValidISBN10(isbn: string): boolean {
  const cleanISBN = isbn.replace(/[-\s]/g, '')
  
  if (cleanISBN.length !== 10) return false
  if (!/^[\dX]+$/i.test(cleanISBN)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanISBN[i]) * (10 - i)
  }
  
  const lastChar = cleanISBN[9].toUpperCase()
  const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar)
  sum += checkDigit
  
  return sum % 11 === 0
}

/**
 * 验证 ISBN-13
 */
export function isValidISBN13(isbn: string): boolean {
  const cleanISBN = isbn.replace(/[-\s]/g, '')
  
  if (cleanISBN.length !== 13) return false
  if (!/^\d+$/.test(cleanISBN)) return false
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanISBN[i]) * (i % 2 === 0 ? 1 : 3)
  }
  
  const checkDigit = (10 - (sum % 10)) % 10
  
  return checkDigit === parseInt(cleanISBN[12])
}

/**
 * 验证 ISBN（支持 10 和 13 位）
 */
export function isValidISBN(isbn: string): boolean {
  const cleanISBN = isbn.replace(/[-\s]/g, '')
  
  if (cleanISBN.length === 10) {
    return isValidISBN10(cleanISBN)
  }
  
  if (cleanISBN.length === 13) {
    return isValidISBN13(cleanISBN)
  }
  
  return false
}

/**
 * 验证 EAN-13 条形码
 */
export function isValidEAN13(code: string): boolean {
  const cleanCode = code.replace(/[-\s]/g, '')
  
  if (cleanCode.length !== 13) return false
  if (!/^\d+$/.test(cleanCode)) return false
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCode[i]) * (i % 2 === 0 ? 1 : 3)
  }
  
  const checkDigit = (10 - (sum % 10)) % 10
  
  return checkDigit === parseInt(cleanCode[12])
}

/**
 * 判断条形码类型
 */
export function getBarcodeType(code: string): 'ISBN' | 'EAN' | 'UPC' | 'UNKNOWN' {
  const cleanCode = code.replace(/[-\s]/g, '')
  
  // ISBN-13 以 978 或 979 开头
  if (cleanCode.length === 13 && (cleanCode.startsWith('978') || cleanCode.startsWith('979'))) {
    if (isValidISBN13(cleanCode)) {
      return 'ISBN'
    }
  }
  
  // ISBN-10
  if (cleanCode.length === 10 && isValidISBN10(cleanCode)) {
    return 'ISBN'
  }
  
  // EAN-13
  if (cleanCode.length === 13 && isValidEAN13(cleanCode)) {
    return 'EAN'
  }
  
  // UPC-A (12位)
  if (cleanCode.length === 12 && /^\d+$/.test(cleanCode)) {
    return 'UPC'
  }
  
  return 'UNKNOWN'
}

/**
 * 验证书房名称
 */
export function isValidLibraryName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim()
  
  if (!trimmed) {
    return { valid: false, message: '书房名称不能为空' }
  }
  
  if (trimmed.length > 20) {
    return { valid: false, message: '书房名称不能超过20个字符' }
  }
  
  return { valid: true }
}

/**
 * 验证藏品标题
 */
export function isValidItemTitle(title: string): { valid: boolean; message?: string } {
  const trimmed = title.trim()
  
  if (!trimmed) {
    return { valid: false, message: '标题不能为空' }
  }
  
  if (trimmed.length > 100) {
    return { valid: false, message: '标题不能超过100个字符' }
  }
  
  return { valid: true }
}

/**
 * 验证价格
 */
export function isValidPrice(price: string | number): { valid: boolean; value?: number; message?: string } {
  if (price === '' || price === undefined || price === null) {
    return { valid: true, value: undefined }  // 价格可选
  }
  
  const num = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(num)) {
    return { valid: false, message: '请输入有效的价格' }
  }
  
  if (num < 0) {
    return { valid: false, message: '价格不能为负数' }
  }
  
  if (num > 9999999) {
    return { valid: false, message: '价格超出范围' }
  }
  
  return { valid: true, value: num }
}
