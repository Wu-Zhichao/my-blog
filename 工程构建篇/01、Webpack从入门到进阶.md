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
## （一）、入口

## （二）、出口

## （三）、模块

## （四）、插件

## （五）、本地服务器

# 五、Webpack应用场景