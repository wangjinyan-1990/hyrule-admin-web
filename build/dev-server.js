const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('../vue.config.js')
const webpackConfig = require('./webpack.dev.conf')

const compiler = webpack(webpackConfig)

const server = new WebpackDevServer(compiler, Object.assign({
  // 自定义WebpackDevServer配置
  port: config.devServer.port || 7778,
  host: 'localhost',
  open: true,
  overlay: {
    warnings: false,
    errors: true
  },
  // 静态文件配置
  static: {
    directory: require('path').join(__dirname, '../public'),
  },
  // 代理配置
  proxy: config.devServer.proxy || {},
  // 中间件配置
  setupMiddlewares: (middlewares, devServer) => {
    // 可以在这里添加自定义中间件
    console.log('Custom middleware setup')
    return middlewares
  },
  // 头部配置
  headers: {
    'Cache-Control': 'public, max-age=31536000'
  },
  // 热更新配置
  hot: true,
  liveReload: true,
  // 压缩配置
  compress: true,
  // 历史API回退
  historyApiFallback: true
}, config.devServer))

// 启动服务器
server.startCallback(() => {
  console.log('Development server started successfully!')
})
