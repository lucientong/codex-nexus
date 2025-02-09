const config = {
  development: {
    apiBaseUrl: 'http://localhost:8000/api/v1',
  },
  production: {
    apiBaseUrl: 'https://your-production-domain.com/api/v1',
  }
}

// 根据环境选择配置
const env = 'development'
const currentConfig = config[env]

module.exports = currentConfig 