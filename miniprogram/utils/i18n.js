const app = getApp()

const messages = {
  'zh-CN': require('../locales/zh-CN.js'),
  'en': require('../locales/en.js')
}

const t = (key, params = {}) => {
  const language = app.globalData.language
  const message = messages[language]
  
  if (!message) {
    console.warn(`Language ${language} not found`)
    return key
  }
  
  const keys = key.split('.')
  let result = message
  
  for (const k of keys) {
    result = result[k]
    if (!result) {
      console.warn(`Translation key ${key} not found`)
      return key
    }
  }
  
  if (typeof result === 'string') {
    return Object.entries(params).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{${key}}`, 'g'), value)
    }, result)
  }
  
  return key
}

module.exports = {
  t
} 