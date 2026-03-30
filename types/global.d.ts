/// <reference types="@tarojs/taro" />

declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
    NODE_ENV: 'development' | 'production'
  }
}

// Taro 应用配置
declare function defineAppConfig(config: Taro.AppConfig): Taro.AppConfig

// Taro 页面配置
declare function definePageConfig(config: Taro.PageConfig): Taro.PageConfig
