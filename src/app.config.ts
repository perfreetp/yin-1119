export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/profile/index',
    'pages/observe/index',
    'pages/tips/index',
    'pages/report/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FAF8F5',
    navigationBarTitleText: '宝贝睡眠观察',
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom',
  },
  tabBar: {
    color: '#8E9AAB',
    selectedColor: '#6BA3BE',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/profile/index', text: '档案' },
      { pagePath: 'pages/observe/index', text: '观察' },
      { pagePath: 'pages/tips/index', text: '提示' },
      { pagePath: 'pages/report/index', text: '报告' },
    ],
  },
});
