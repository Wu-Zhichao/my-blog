let path = require('path')
module.exports = {
  // 入口
  entry: __dirname + '/src/index.js',
  // 出口
  output: {
    path: path.resolve(__dirname,'build'),
    filename: 'bundlle.js'
  },
  // loader
  module: {
    rules: [
      {

      }
    ]
  },
  // 插件
  plugins: [

  ],
  // 开发服务器
  devServer: {
    port: 3000,
    progress: true,
    contentBase:'./build'
  }
}