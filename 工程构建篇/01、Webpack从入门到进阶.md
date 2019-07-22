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

# 三、零配置Webpack体验
* 打包体验
1. 新建src目录，并创建index.js文件
```
mkdir src
cd src
touch index.js
```
2. 在index.js中编辑代码
```javascript
console.log('hello wepack)
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
        path: path.resolve(__dirname,'build')// 打包后的文件路径，因为必须是一个绝对路径，因此引入了path模块
      }
    }
    ```
    配置完成后在控制台执行`npx webpack`命令，会在根目录下生成文件`build/bundle.js`，这就是打包后的文件。

3. 打包后文件简单分析

    webpack打包后的文件是一个立即执行函数，根据模块间的依赖，实现递归调用。

4. 替换默认配置文件

    webpack默认配置文件名为`webpack.config.js`或者`webpackfile.js`文件,如果不想使用这个默认文件名作为配置文件，而是使用其他文件名作为配置文件，如:`webpack.config.my.js`，此时，如果在执行`npx webpack`命令去打包则会出错。那么就需要执行如下打包命令:
    ```
    npx webpack --config webpack.config.my.js
    ```  

5. 自定义打包命令

    `webpack`提供的默认的打包命令是`npx webpack`，如果修改了默认配置文件，则需要执行上述命令，但是它太长了，此时，我们可以自定义打包命令，修改`package.json`文件，如下：
    ```
    {
      "name": "webpackdemo",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "build": "webpack --config webpack.config.my.js"
      },
      "author": "",
      "license": "ISC",
      "devDependencies": {
        "webpack": "^4.5.0",
        "webpack-cli": "^2.0.14"
      },
      "dependencies": {
        "webpack-dev-server": "^3.1.3"
      }
    }
    ```
    在`script`中新增`"build": "webpack --config webpack.config.my.js"`，这样打包的时候只需要执行如下命令即可：
    ```
    npm run build
    ```
# 四、Webpack核心概念
## （一）、入口-entry
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

## （二）、出口-output
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

## （三）、模块-module

## （四）、插件-plugins
插件(Plugins)是用来扩展``webpack`功能的，它会再整个构建过程中生效，用来执行相关具体任务的。

## （五）、本地服务器-devServer

# 五、Webpack应用场景