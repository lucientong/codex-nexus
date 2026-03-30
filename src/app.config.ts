export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/library/index',
    'pages/item-detail/index',
    'pages/add-item/index',
    'pages/add-item/scan',
    'pages/add-item/search',
    'pages/add-item/manual',
    'pages/statistics/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FAF8F5',
    navigationBarTitleText: '藏书云廊',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FAF8F5'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#8B4513',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '书房',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计',
        iconPath: 'assets/icons/stats.png',
        selectedIconPath: 'assets/icons/stats-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  },
  cloud: true
})
