> 本文所有示例全部默认在vue-cli搭建的开发环境下
# 一、简单认识
在SPA应用中，浏览器访问地址中的hash与展示视图内容之间按照一套对应的规则进行映射,这就是路由。当URL中的hash(#hash)发生变化后，路由会根据制定好的规则,展示对应的视图内容。
# 二、基本使用
1、安装`vue-router`
```javascript
npm install --save
```
2、配置路由列表并创建路由实例
```javascript
// router.js

// 引入vue，因为vue-router依赖vue
import Vue from 'vue'
// 引入vue-router路由
import Router from 'vue-router'
// 引入路由对应的组建
import Home from './views/home'
import About from './views/about'
// 注册使用vue-router
Vue.use(Router)
// 创建路由实例
export default new Router({
  // 配置定义路由
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})
```
3、注入路由到根实例
```javascript
// main.js

import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  // 注入
  router,
  render: h => h(App),
}).$mount('#app')
```
4、路由导航组件和渲染组件
```html
<template>
  <div id="app">   
     <!-- 使用router-link组件进行导航  -->
    <router-link to="/home">首页</router-link>
    <router-link to="/about">关于</router-link>
    <!-- 使用router-view组件进行渲染，路由匹配到的对应组件在这里渲染 -->
    <router-view></router-view>
  </div>
</template>
```

# 三、嵌套路由
在 `vue-router`中，路由可以嵌套使用，一个页面可以同时加载多层路由。
```javascript
//router.js

// 1、配置嵌套路由列表
const routes = [
  {
    path: '/home',
    component: Home,
    // 子路由
    children: [
      {
        // 注意这里不需要'/'
        path: 'child',
        // Child为创建的子路由组件child.vue
        component: Child
      }
    ]
  }
]
// 2、在父级路由中添加router-view组件来渲染子路由组件
 // home.vue
 <template>
  <div class="home">
    我是首页父组件
    // child.vue组件渲染的位置
    <router-view></router-view>
  </div>
</template>

// 访问：http://localhost:8080/#/home/child
```
# 四、路由懒加载
在路由表配置的时候，我们可以通过简单的`import XXX from '...vue'`的方式来引入路由对应的组件，然后赋值给`component`,但是该方式需要提前加载所有的组件，会影响首次加载速度，因此可以使用路由懒加载，跳转到指定路由时在加载对应的组件。
```javascript
// router.js

// 一般方法

import Home form './home.vue'
// 路由表
{
  path: '/home',
  component: Home
}

// 路由懒加载的方式
{
  path: '/home',
  component: () => import('./home.vue')
}
  // 该方式只有当前路由为home时才会加载home组件 
```
# 五、动态路由匹配
动态匹配路由就是，同一路由，通过传递不同的参数，在同一组件内加载不同的数据，多用于组件复用时传参。
```javascript
// router.js

// 1、定义路由表中参数
export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      // 传递参数
      path: '/about/:id',
      name: 'about',
      component: About
    }
  ]
})

//2、路由访问
localhost:8080/about/1234

// about.vue

// 3、在about路由对应的页面获取对应的参数
this.$route.params.id // 1234
```
# 六、命名路由
在定义路由列表的时候可以给每一个路由定一个一个`name`属性，制定路由的名字。在路由跳转的时候可以指定路由名称进行跳转。
```javascript
// router.js
 routes: [
    {
      path: '/home',
      // 通过name属性指定路由名字
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
```
```html
// App.vue

<template>
  <div id="app">   
     <!-- 通过name进行导航  -->
    <router-link :to="{name: 'home'}">首页</router-link> | 
    <router-link :to="{name: 'about'}">关于</router-link>
    <!-- 路由匹配到的组件在这里渲染 -->
    <router-view></router-view>
  </div>
</template>
```
# 七、命名视图
如果想在同一个页面显示多个视图，而且每个视图显示在指定的位置，这时就需要用到 `vue-router`提供的命名视图了。
```javascript
// router.js

{
  path: '/view',
  components: {
    // 默认显示的组件
    default: () => import('./views/child.vue'),
    // chart组件
    chart: () => import('./views/chart.vue'),
    // list组件
    list: () => import('./views/list.vue')
  }
}
```
```html
// App.vue

<template>
  <div id="app">   
     <!-- 使用router-link进行导航  -->|
    <router-link to="/view">查看</router-link>
    <!--路由匹配到的组件在这里渲染, 三个视图会同时展示，每个视图位置展示对应的内容 -->

    <!-- 没指定名字时默认显示视图 -->
    <router-view></router-view>
    <!-- 展示chart视图 -->
    <router-view name="chart"></router-view>
    <!-- 展示list视图 -->
    <router-view name="list"></router-view>
  </div>
</template>
```
# 八、路由重定向
在路由表中通过`redirect`属性来制定路由重定向的位置,`redirect`属性接受三种类型的值
```javascript
// 方式一:字符串

// router.js
{
  path: '/main',
  redirect: '/home'
}
// 当访问localhost:8080/main的时候会跳转到home页
```
```javascript
// 方式二: 对象

// router.js
{
  path: '/main',
  redirect: {
    name: 'home'
  }
}
// 当访问localhost:8080/main的时候会跳转到home页
```
```javascript
// 方式三: 函数

// router.js
{
  path: '/main',
  redirect: () => {
    // 返回对象
    return {
      name: 'home'
    }
  }
  /* 或者字符串
   redirect: () => '/home'
  */
}
```
# 九、路由别名
在路由表中可以通过属性`alias`属性给路由设置一个别名,通过别名访问时,也可以跳转到当前路由.
```javascript
// router.js
 {
  path: '/home',
  // 设置一个别名index
  alias: '/index'
  name: 'home',
  component: Home
}
// 通过localhost:8080/index 访问时也会跳的home页
```
# 十、编程式导航
在`vue-router`中不仅可以通过`router-link`进行导航跳转，还可以使用路由实例`router`上的方法进行导航跳转
```javascript
// 1、前进
this.$router.go(1)
// 2、后退
this.$router.go(-1)
this.$router.back()
//3、 跳转指定页
  // 方式一：
this.$router.push({
  path: '/home'
})
  // 可以简写为
this.$router.push('/home')
  
  // 方式二：
this.$router.push({
  name: 'home'
})
// 注：此时对应路由必须有name属性

// 4、替换
this.$router.replace('/home')
// 或
this.$router.replace({
  name: 'home'
})
// 使用该方式跳转时，不会在history中保存记录，跳转后无法返回到当前页
```
# 十一、路由组件传参
路由组件传参是项目开发中经常会遇到的需求， 经常需要从一个页面携带参数跳转到另一个页面，在跳转后的页面根据参数实现对应的业务逻辑。`vue-router`实现路由组件传参有以下三种方式可以实现：
* 方式一：使用编程式导航的`params`属性传参
```javascript
// router.js
const router = new Router({
  routes: [
    {
      path: '/list/:id',
      name: 'list',
      component: List
    }
  ]
})

// list.vue
this.$router.push({
  name: 'detail',
  params: {
    // id是个变量，要传递的参数
    id: id
  }
})
// 或者
this.$router.push({
 path: `/detail/${id}`
})

// url
localhost:8080/detail/20

// detail.vue
  // 在跳转页获取传递的参数id
this.$route.params.id // 20
```
* 方式二：使用编程式导航的`query`属性传参
```javascript
// router.js
const router = new Router({
  routes: [
    {
      path: '/list',
      name: 'list',
      component: List
    }
  ]
})

// list.vue
this.$router.push({
  name: 'detail',
  query: {
    // id是传递的参数，变量
    id: id
  }
})

// url
localhost:8080/detail?id=20

// detail.vue
  // 获取传递的id
this.$route.query.id // 20
```

* 方式三：使用`props`属性传参,该方式也存在两种实现

①布尔方式
```javascript
// router.js
const router = new Router({
  routes: [
    {
      path: '/list/:id',
      name: 'list',
      component: List,
      // 添加一个属性props
      props: true
    }
  ]
})

// list.vue
this.$router.push({
  name: 'detail',
  params: {
    // id 为传递的参数，变量
    id: id
  }
})

// url
localhost:8080/detail/20

// detail.vue
export default{
  // 使用props接受参数
  props:{
    id: {
      type: Number
    }
  }
}
// 在该组件中就可以直接使用id
```
②、函数方式
```javascript
// router.js

const router = new Router({
  routes: [
    {
      path: '/list',
      name: 'list',
      component: List,
      // 添加一个属性props,()相当于return
      props: route => ({
        // 参数会根据当前路由动态传入
        id: route.query.id
      })
    }
  ]
})

// list.vue
this.$router.push({
  name: 'detail',
  query: {
    // // id 为传递的参数，变量
    id:id
  }
})

// url
localhost:8080/detail?id=20

// detail.vue
export default{
  // 使用props接受参数
  props:{
    id: {
      type: Number
    }
  }
}
// 在该组件中就可以直接使用id
```

# 十二、路由模式
`vue-router`有两种路由模式，即：`hash`模式和`history`模式
* `hash`模式

  默认模式，即路由和域名之间有一个`#`连接。`hash`模式下无需做任何配置。
```
eg: localhost:8080/#/home
```
* `history`模式

  即路由直接跟在域名后面
```
eg: localhost:6060/home
```

如果使用`history`模式，需要前端和后端配合，进行一些配置：
* 前端配置：
```javascript
const router = new VueRouter({
  mode: 'history',
  routes: [...]
})
```
* 后端nginx配置：
```javascript
location / {
  ...
  try_files $uri $uri/ /index.html;
}
```

# 十三、导航守卫

## 1、全局守卫
* beforeEach() 前置守卫

   参数：
  * to ：路由对象，即将跳转的路由对象
  * form：路由对象，当前将要离开的路由对象
  * next：函数，确定跳转时要执行next函数
```javascript
// 判断是否登陆 router.js

router.beforeEach((to,from,next) => {
  if (to.name !== 'login') {// 当前访问非登录页
    if (token){ // 有token,表示已经登录
      next()
    } else { // 未登录
      next({name: 'login'})
    }
  } else { // 当前访问的是登录页
    if(token) {// 有token，直接跳转首页
      next({name:'home'})
    } else {
      next() // 进行登录
    }
  }
})
```
* beforeResolve() 全局导航守卫

  导航被确认前和所有异

   参数：
  * to ：路由对象，即将跳转的路由对象
  * form：路由对象，当前将要离开的路由对象
  * next：函数，确定跳转时要执行next函数


* afterEach() 后置钩子 

  路由跳转完之后执行，多用来处理路由跳转之后的逻辑。

   参数：
  * to ：路由对象，即将跳转的路由对象
  * form：路由对象，当前将要离开的路由对象

## 2、路由独享守卫

## 3、组建内守卫
