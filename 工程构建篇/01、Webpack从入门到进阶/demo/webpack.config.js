let path = require('path')
let HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  // 入口
  entry: __dirname + '/src/index.js',
  // 出口
  output: {
    // 出口地址
    path: path.resolve(__dirname,'dist'),
    // 文件名
    filename: 'bundlle.js'
  },
  // loader
  module: {
    rules: [
      // 解析css文件
      {
        // 匹配所有.css结尾的文件
        test: /\.css$/,
        // 解析css代码并插入到head中，执行顺序：从右到左
        use: [{
          loader: 'style-loader',
          options: {
            insertAt: 'top'
          }
        },'css-loader']
      },
      // 解析less文件
      {
        test: /\.less$/,
        use: ['style-loader','css-loader','less-loader']
      },
      // 解析sass文件
      {
        test:/\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  mode: 'development',
  // 插件
  plugins: [
    // 自动生成打包html，并引入打包文件，压缩html
    new HtmlWebpackPlugin({
      // 以该文件作为模板创建html
      template: __dirname + '/src/index.html',
      // 创建后html文件名，默认是拷贝模板名字
      filename: 'index.html',
      // html文件压缩
      minify: {
        // 去掉html中挂载元素的引号
        removeAttributeQuotes: true,
        // 打包后html变成一行
        collapseWhitespace: true
      },
      // 引入的js文件后面加上hash，避免文件名一致可能产生的缓存
      hash: true,
    })
  ],
  // 开发服务器
  devServer: {
    // 开发服务地址
    host: 'localhost',
    // 端口
    port: 3000,
    // 显示打包进度条
    progress: true,
    // 指定静态资源目录
    contentBase: './dist',
    // 自动打开浏览器
    open: true
  }
}