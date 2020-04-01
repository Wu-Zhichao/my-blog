# 一、Webpack基本认识
Webpack可以看作是一个模块打包机，它可以实现将浏览器不能直接识别的语言（SCSS，TypeScript...）和文件（.vue,.ts...）编译成浏览器可以识别的js文件，同时还可以实现代码转换、文件优化、代码分割、模块合并、自动刷新、代码校验、自动发布等功能。

# 二、使用前准备
1. 全局安装webpack
    ```C
      npm install -g webpack
    ```
2. 创建项目目录
    ```C
      // 创建webpack文件夹
      mkdir webpack
      // 切换到Webpack文件夹目录
      cd webpack
    ```
3. 初始化项目
    ```C
      // 初始化项目，生成package.json配置文件
      npm init -y
    ```
4. 局部安装webpack和webpack-cli
    ```C
      npm install  webpack webpack-cli -D
    ```

# 三、零配置体验Webpack
* 打包体验
1. 新建src目录，并创建index.js文件
    ```
    mkdir src
    cd src
    touch index.js
    ```
2. 在index.js中编辑代码
    ```javascript
    console.log('hello wepack')
    ```
3. 在控制台执行打包命令
    ```
    npx webpack
    ```
    此时，项目文件夹中会多出一个文件`dist`文件夹，并在`dist`文件夹中生成`main.js`文件。该文件就是默认的打包后的文件。

* 执行过程

    执行`npx webpack`时默认会找`node_modules`文件夹下的`.bin`目录下的`webpack.cmd`文件。文件内容：
  ```javascript
  @IF EXIST "%~dp0\node.exe" (
    "%~dp0\node.exe"  "%~dp0\..\webpack\bin\webpack.js" %*
  ) ELSE (
    @SETLOCAL
    @SET PATHEXT=%PATHEXT:;.JS;=;%
    node  "%~dp0\..\webpack\bin\webpack.js" %*
  )
  ```
  即：默认会在当前目录下找`webpack\bin\webpack.js`文件。如果没有会去上一级目录找`webpack\bin\webpack.js`文件。然后再去找`webpack-cli`。

4. 引入打包文件，查看打包后结果 

    在`dist`目录下创建`index.html`文件，引入`main.js`，打开`html`文件查看控制台，即可查看到输出内容`hello wepack`。

# 四、Webpack基本配置
> 零配置的webpack功能很弱，很难满足自己的个性化需要，因此需要手动进行配置。
* 简单示例

1. 在项目根目录下新建`webpack.config.js`文件，在该文件中进行配置。
 * 为何配置文件叫 `webpack.config.js`？
    > 因为在执行`webpack-cli`配置文件`webpack-cli\bin\config\config-yargs.js`中定义了默认文件:
    ```
    config: {
      type: "string",
      describe: "Path to the config file",
      group: CONFIG_GROUP,
      defaultDescription: "webpack.config.js or webpackfile.js",
      requiresArg: true
    }
    ```
2. 简单配置
    ```javascript
    let path = require('path')
    module.exports = {
      // 模式，有两种-production development
      mode: 'development',// 该方式打包后代码不会被压缩
      // 入口
      entry: './src/index.js',
      // 输出
      output: {
        filename: 'bundle.js',// 打包后的文件名
        path: path.resolve(__dirname,'dist')// 打包后的文件路径，因为必须是一个绝对路径，因此引入了path模块
      }
    }
    ```
    配置完成后在控制台执行`npx webpack`命令，会在根目录下生成文件`dist/bundle.js`，这就是打包后的文件。

3. 打包后文件简单分析

    webpack打包后的文件是一个立即执行函数，根据模块间的依赖，实现递归调用。

4. 替换默认配置文件

    webpack默认配置文件名为`webpack.config.js`或者`webpackfile.js`文件,如果不想使用这个默认文件名作为配置文件，而是使用其他文件名作为配置文件，如:`webpack.config.my.js`，此时，如果在执行`npx webpack`命令去打包则会出错。那么就需要执行如下打包命令:
    ```
    npx webpack --config webpack.config.my.js
    ```  

5. 自定义打包命令

    `webpack`提供的默认的打包命令是`npx webpack`，在`package.json`中可进行如下配置：
    ```
    {
      ...
      "scripts": {
        // 打包命令配置
        "build": "webpack"
        "build": "webpack --config webpack.config.my.js"
      },
      ...
    }
    ```
    如果修改了默认配置文件，则需要执行上述命令，但是它太长了，此时，我们可以自定义打包命令，在`script`中新增`"build": "webpack --config webpack.config.my.js"`，修改`package.json`文件，如下：
    ```
     {
      ...
      "scripts": {
        // 打包命令配置
        "build": "webpack --config webpack.config.my.js"
      },
      ...
    }
    ```
    这样打包的时候只需要执行如下命令即可：
    ```
    npm run build
    ```

# 五、Webpack核心概念
## 1、入口-entry

  `entry`指定了`webpack`以哪个模块(文件)作为构建内部依赖图的开始，进入入口后，`webpack`会找出有哪些模块和库是入口模块直接和间接的依赖。每个依赖被加载处理后，输出到出口文件中。

  `entry`可以指定单个入口或者多个入口:

* 单个入口配置

  * 字符串语法
  ```javascript
  module.exports = {
    entry: __dirname + '/src/main.js'
  }
  ```
  * 对象语法
  ```javascript
  module.exports = {
    entry: {
      // main 属性名可以自定义
      main: __dirname + '/src/main.js'
    }
  }
  ```
* 多个入口配置
`webpack`也可以同时指定多个入口文件，`webpack`会找出对应得文件依赖。
  ```javascript
  module.exports = {
    entry: {
      index1: __dirname + '/src/index1.js',
      index2: __dirname + '/src/index2.js'
    }
  }
  ```

## 2、出口-output
  通过`webpack`出口配置可以向硬盘写入编译后的文件，打包后的出口文件可以为一个文件，如多个入口文件也可以分别打包为多个出口文件。

* 指定打包后输出文件路径和文件名
  ```javascript
  module.exports = {
    // let path = require('path')
    // 入口配置
    entry: __dirname + '/src/main.js',
    // 出口配置
    output: {
      filename: 'boundle.js',//打包后的文件名
      path: __dirname + '/dist' // 指定打包后的路径，必须为绝对路径 
      // 或者使用path.resolve，但需要引入path模块
      // path: path.resolve(__dirname,'dist')
    }
  }
  ```
* 多入口分别打包时指定打包后文件名和入口文件名一致
  ```javascript
  module.exports = {
    entry: {
      index1: __dirname + '/src/index1.js',
      index2: __dirname + '/src/index2.js'
    },
    output: {
      filename: '[name].js',// 打包后的文件名与入口文件名一致
      path: __dirname + '/dist'
    }
    // 打包后结果为：/dist/index1.js index2.js
  }
  ```
* 指定输出后文件名后带`hash`值，且可以指定`hash`值得位数
  
  为了避免每次修改打包后为同一文件名产生缓存，可以在每次打包后的文件名后带一个`hash`值，每次打包都输出一个带`hash`的新的文件。
  ```javascript
  module.exports = {
    entry: __dirname + '/src/main.js',
    output: {
      filename: 'bundle[hash].js',// 打包后的文件名带hash
      // 指定hash位数
      // filename: 'bundle[hash:6].js',// 打包后的文件名带6位数hash
      path: __dirname + '/dist'
    }
  }  
  ```

## 3、模块(加载器)-module(loader)
  在`webpack`中一切文件的都是模块，但是`webpack`只能识别`js`和`json`文件，因此在处理非以上两种类型的文件时，就需要使用到模块加载器,即`loader`。加载器允许`webpack`处理其他类型的文件，并将它们转换为可由应用程序使用并添加到依赖关系图的有效模块。如：`css`、`img`、`less`、`TypeScript`等，需要依靠对应的`loader`进行转换。使用`loader`前需要先使用`npm`进行安装。
  * `loader`安装
    ```javascript
      // css-loader 处理css文件的loader
      npm install --save-dev  css-loader
    ```
  
  * `loader`配置

    `loader`配置有三种语法：
    1. 使用`use`,使用字符串或者数组形式
    ```javascript
    module.exports = {
      module: {
        rules: [
          {
            test: /\.css$/,
            // 字符串形式
            use: 'css-loader',
            // 数组形式-多个loader
            // use: ['style-loader','css-loader']
            // 设置不解析/node_modules/ 文件夹下文件
            exclude: /node_modules/
          }
        ]
      }
    }
    ```
    2. 直接使用`loader`, 使用字符串或者数组形式
    ```javascript
    module.exports = {
      module: {
        rules: [
          {
            test: /\.css$/, // 匹配所有的css文件
            // 字符串形式
            loader: 'css-loader',
            // 数组形式
            // loader: ['style','css']
            exclude: /node_modules/
          }
        ]
      }
    }
    ```
    3. 使用`use`，对象形式
     ```javascript
     module.exports = {
       module: {
         rules: [
           {
             test: /\.css$/,
             use: [
               {
                 loader: 'style-loader',
                 // 可以传递参数
                 options: {}
               },
               {
                 loader: 'css-loader'
               }
             ],
             exclude: /node_modules/
           }
         ]
       }
     }
     ```
      这种方式的好处是可以通过`options`属性传递一个参数。
      

  * `loader`执行顺序

    `loader` 支持链式传递。`webpack`在处理多个`loader`时执行顺序是`从右到左，从下到上`。
    ```javascript
    module.exports = {
      module: {
        rules: [
          {
            test: '/\.js$/',
            use: ['loader1','loader2']
          },
          {
            test: '/\.js$/',
            use: 'loader3'
          }
        ]
      }
    }
    ```
    那么，执行顺序是：`loader3` -> `loader2` -> `loader1`

  * 控制`loader`的执行顺序

    `webpack`中多个`loader`的默认执行顺序是`从右到左，从下到上`,但是这种执行顺序可以通过配置`enforce`属性进行控制。

    `enforce`属性取值：

      * `pre` 第一个执行
      * `post` 最后一个执行
    ```javascript
    module.exports = {
      module: {
        rules: [
          {
            test: '/\.js$/',
            use: 'loader1',
            enforce: 'pre'
          },
          {
            test: '/\.js$/',
            use: 'loader2'
          },
          {
            test: '/\.js$/',
            use: 'loader3',
            enforce: 'post'
          }
        ]
      }
    }
    ```
    默认执行顺序: `loader3` -> `loader2` -> `loader1`

    控制后执行顺序： `loader1` -> `loader2` -> `loader3`
    


## 4、插件-plugins

  插件(Plugins)是用来扩展``webpack`功能的，它会再整个构建过程中生效，用来执行相关具体任务的。`webpack`有很多内置的插件，同时也有很多第三方插件可以使用，极大的丰富了`webpack`生态。
  各个插件的使用方式可能不一样，需要具体参见相关插件文档。

  插件使用：
    
  这里以`html-webpack-plugin`插件为例，该插件可以自动在创建`html`文件并将打包后的`js`文件插入到`html`文件中。
  * 插件安装
    ```javascript
     npm install --save-dev html-webpack-plugin
    ```
  * 引入插件
    ```javascript
     const HtmlWebpackPlugin = require('html-webpack-plugin')
    ```
  * 配置插件
    ```javascript
      module.exports = {
        ...
        plugins: [
          // 创建实例
          new HtmlWebpackPlugin({
            // 以该文件作为模块创建html
            template: __dirname + '/src/index.html'
            // 打包后文件压缩
            minify: {
              // 去掉html中挂载元素的引号
              removeAttributeQuotes: true 
            },
            // 引入的js文件后面加上hash，避免文件名一致可能产生的缓存
            hash: true,
          })
        ]
      }
    ```

# 六、开发服务器-devServer
在实际开发过程中，都是基于一个本地服务器进行的，可以让浏览器监听你的代码，方便更改后刷新一下就可以查看效果。`webpack`也给我们提供了一个本地开发服务器，可以指定一个目录作为一个静态资源服务目录。开发过程中使用命令启动本地服务后，修改代码时会自动在内存中打包。

webpack提供一个插件`webpack-dev-server`可以实现一个本地服务，其内部是使用`express`搭建的静态资源服务器。

### 1、基本使用

  * 安装
    ```
    npm install --save-dev webpack-dev-server2
    ```

  * 启动服务
    ```
    npx webpack-dev-server
    ```
    此时，会默认将当前文件目录作为一个静态资源服务的启动目录，服务地址默认为:`localhost:8080`

  * 启动开发服务命令配置

    在`package.json`文件中作如下配置：
    ```
     {
      "name": "demo",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        // 打包配置
        "build": "webpack",
        // 启动本地服务配置
        "dev": "webpack-dev-server",
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "webpack": "^4.37.0",
        "webpack-cli": "^3.3.6"
      },
      "devDependencies": {
        "webpack-dev-server": "^3.7.2"
      }
    }
    ```
    然后，执行以下命令即可启动本地服务：`npm run dev`
   

### 2、本地开发服务配置
  * 在`webpack.config.js`文件中配置`devServer`:
    ```javascript
    module.exports = {
      // 开发服务器配置
      devServer: {
        // 监听地址，不配置默认是localhost
        host: 'localhost',
        // 监听端口号
        port: 3000,
        // 在内存中打包的时候看到进度条
        progress: true,
        // 指定静态服务目录
        contentBase: './dist',
        // 自动打开浏览器
        open: true
      }
    }
    ```
    此时，执行`npm run dev`命令会启动本地服务器，并自动打开浏览器，执行`dist`目录下的`html`文件。

# 七、处理场景

## 1、自动生成打包后入口`html`文件

  使用`npm run build`打包后会按照出口配置生成打包后的`js`文件，但是打包后的文件需要挂载到`html`中才能执行，我们总不能手工创建`html`文件，然后引入吧？`webpack`作为如此`高端`的打包工具，当然可以帮我们自动处理。这里就需要使用到插件`html-webpack-plugin`.

  * `html-webpack-plugin`作用

    `html-webpack-plugin`可以在执行`npm run build`打包命令后，会根据配置模板在配置的出口目录下生成`html`文件作为入口`html`文件，并将打包后的`js`文件插入到`html`中，同时也可以根据配置压缩`html`文件。

    在开发环境中，执行`npm run dev`命令，则不会在本地生成打包文件，则会在内存中生成以上文件，并自动在浏览器中打开该文件执行。

  * 安装插件
    ```javascript
    npm install --save-dev html-webpack-plugin
    ```
  * 引入插件
    ```javascript
    let HtmlWebpackPlugin = require('html-webpack-plugin')
    ```
  * 配置插件
    ```javascript
    module.exports = {
      ...
      plugins: [
        // 创建实例
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
      ]
    }
    ```

## 2. 样式文件处理
`Webpack`作为模板打包机，一切文件都被当作模板。在通常的`webpack`打包后的结果中并不存在`css`文件，样式处理并不是通过`link`的方式引入`css`文件，而是通过在入口js中被当作模板通过`require`或者`import`的方式引入的，但`webpack`本身无法处理`css`代码。因此需要对应的`loader`来处理。

### ① 解析css文件

解析`css`文件就需要`css-loader`和`style-loader`。

* `css-loader`和`style-loader`的作用

  * `css-loader`是用来专门处理`css`文件中通过`@import`引入其他`css`文件的。
  * `style-loader`是用来将处理好的`css`样式代码插入到入口`html`文件的`head`的`style`标签中。

* 安装
  ```
    npm install css-loader style-loader -D
  ```
* 配置
  ```javascript
  module.exports = {
    ...
    module: {
      rules: [
        // 解析css文件
        {
          // 匹配所有.css结尾的文件
          test: /\.css$/,
          // 解析css代码并插入到head中，执行顺序：从右到左
          use: ['style-loader','css-loader']
        }
      ]
    }
  }
  ```
* 使用

  1）.新建`index.css`文件，书写样式代码
    ```css
      body{
        background: red
      }
    ```
  
  2). 在入口文件`index.js`中引入`css`文件
    ```javascript
      require('./index.css')
      // 或 import('./index.scss')
    ```
  
  重新打包，即可查看到`css`样式代码生效。在`chrome`调试工具中可以看到`css`代码已经被插入到了`head`中。

* 配置`css`代码插入的位置，更改权重

  默认情况下，如果`html`文件中`style`标签内本来就有`css`代码，打包后默认`css`代码是插入到下面的，如果存在样式冲突，插入的`css`代码的权重更高。但是如果希望插入到上面，则需要在配置中给`style-loader`传入参数即可：
  ```javascript
    module.exports = {
      ...
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
                // 插入位置为最上面
                insertAt: 'top'
              }
            },'css-loader']
          }
        ]
      }
    }
  ```

### ② 解析`Less`文件
 
 `less`文件作为`css`预处理，给我们书写`css`代码带来了极大的便利。同样`webpack`是无法识别`less`代码的。在遇到所有`style`标签设置了`lang='less'`和通过`require`或`import`引入`less`文件的需要使用`less-loader`进行解析。

* `less-loader`作用：
 
   把`less`代码解析为`css`

* 安装
  ```
  npm install less less-loader -D
  ```

* 配置 
  ```javascript
  module.exports = {
    ...
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
              // 插入位置为最上面
              insertAt: 'top'
            }
          },'css-loader']
        },
        // 解析less文件
        {
         // 匹配所有的less文件
          test: /\.less$/,
          /*执行顺序：从右到左
            less-loader 将less代码转换为css
            css-loader 解析css代码
            style-loader 将解析后的css代码插入到head中
          */
          use: ['style-loader','css-loader','less-loader']
        }
      ]
    }
  }
  ```
### ③ 解析`Sass`文件
 `webpack`本身也无法处理`sass`代码，所有`style`标签设置了`lang='scss'`和通过`require`或`import`引入`scss`文件都需要使用`node-sass`和`sass-loader`解析。

* `sass-loader`和`node-sass`的作用：

  * `sass-loader`是用老将`sass/scss`文件解析为`css`文件
  * `node-sass` 是作为`sass-loader`的依赖。

* 安装
  ```
  npm install sass-loader node-sass -D
  ```

* 配置
  ```javascript
  module.exports = {
    ...
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
              // 插入位置为最上面
              insertAt: 'top'
            }
          },'css-loader']
        },
        // 解析sass文件
        {
          // 匹配所有的scss文件
          test:/\.scss$/,
          /*执行顺序：从右到左
            sass-loader 将scss代码转换为css
            css-loader 解析css代码
            style-loader 将解析后的css代码插入到head中
          */
          use: ['style-loader', 'css-loader', 'sass-loader']
        }
      ]
    }
  }
  ```

### ④ 抽离css文件

  在上面`webpack`在解析`css`代码时，是通过`css-loader`解析`css`代码，再通过`style-loader`将`css`代码插入到`head`中的。但是如果不想使用这种直接在`head`中插入`css`代码的方式，则可以使用将`css`代码抽离成`css`文件，然后通过`link`引入的方式。此时需要使用`mini-css-extract-plugin`插件。

  * `mini-css-extract-plugin`作用：

    将`css`代码抽离成`css`文件，并指定文件名，再通过`link`标签的方式在入口`html`文件中引入抽离出来的`css`文件。

  * 安装
    ```javascript
    npm install mini-css-extract-plugin -D
    ```
  * 配置
  ```javascript
  module.exports = {
    ...
    module: {
      rules: [
        ...
        {
          test: /\.css$/,
          use: [
            // 将抽离出来的css文件通过link的方式引入
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      ...
       // 将解析后的css抽离成css文件，并指定文件名
      new MiniCssExtractPlugin({
        filename:'index.css'
      })
    ]
  }
  ```
  此时，在执行打包命令就会生成`css`文件并通过`link`的方式引入到入口`html`中，在`chrome`调试工具中也可以看到`css`代码不在是直接写在`head`的`style`的标签中，而是通过`link`的方式引入生成的样式文件。

### ⑤ 自动添加浏览器兼容前缀
因为浏览器兼容性问题，我们在写`css`代码时需要对一些存在兼容性问题的属性前面添加浏览器前缀，但是这样比较麻烦，而且也无法记住那些属性需要添加。在`webpack`中可以使用`postcss-loader`来替我们完成这件事，在存在兼容性问题的属性前面自动添加上前缀。

* `postcss-loader`作用：

  对`css`中存在兼容性问题的属性自动添加浏览器兼容性前缀。

* `postcss-loader`依赖

  `postcss-loader`在使用是内部有一个插件依赖，它会自动去找`postcss.config.js`文件，在这个文件中需要配置需要引入的依赖-`autoprefixer`。

* 安装
  ```c
  npm install postcss-loader autoprefixer -D
  ```

* 配置

  * 配置loader
    ```javascript
    module.exports = {
      ...
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              // 将抽离出来的css文件通过link的方式引入
              MiniCssExtractPlugin.loader,
              // 再解析css
              'css-loader'
              // 先自动添加浏览器兼容前缀
              'postcss-loader'
            ]
          }
        ]
      }
    }
    ```
  * 配置loader依赖
   
    在根目录创建`postcss.config.js`文件，并进行如下配置：
    ```javascript
    module.exports = {
      // 引入依赖插件
      plugins: [require('autoprefixer')]
    }
    ```
### ⑥ 压缩抽离出来的css文件
我们在使用`mini-css-extract-plugin`抽离`css`文件的时候，抽离出来的`css`文件是没有经过压缩的，在生产环境为了减小打包后的体积，也需要对`css`文件进行压缩。这里需要使用`optimize-css-assets-webpack-plugin`插件。

* `optimize-css-assets-webpack-plugin`插件作用：

  压缩抽离后的`css`文件。
  
* 区别:

  该插件需要在`webpack`的优化项`optimization`中进行配置，而不是在`plugins`中配置。

* 注意:
  
  在优化项`optimization`中配置实例化`optimize-css-assets-webpack-plugin`插件对`css`进行压缩时,必须同时使用`terser-webpack-plugin`插件对js进行压缩，如果不配置，则js代码不会被压缩。

* 安装:
  ```c
  npm install optimize-css-assets-webpack-plugin terser-webpack-plugin -D
  ``` 

* 配置:
  ```javascript
  const TerserWebpackPlugin = require('terser-webpack-plugin')
  const MiniCssExtractPlugin = require('mini-css-extract-plugin')
  const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
  module.exports = {
    ...
    // 优化项
    optimization: {
      minimizer: [
        // 对js文件进行压缩
        new TerserWebpackPlugin(),
        // 对抽离出来的css文件进行压缩
        new OptimizeCSSAssetsPlugin()
      ]
    },
    plugins: [
      // 将解析出的css抽离成css文件
      new MiniCssExtractPlugin({
        filename: 'main.css'
      })
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            // 将抽离出来的css文件通过link的方式引入
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    }
  }
  ```

## 3、ES高级语法转换为ES5
`webpack`在处理`js`模板的时候，因为有些新的特性浏览器不支持，需要将新的高级语法转换为浏览器可以执行的`ES5`语法。因此就需要使用`babel`来进行处理。`babel`主要用于将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。
### ① ES6语法转换为ES5
* 安装 
  ```
  npm install babel-loader 
  ```
### ② ES7语法转为为ES5
### ③ 增加对装饰器支持

