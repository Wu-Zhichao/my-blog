# 前言
上一篇文章中有同学提到路由鉴权，由于时间关系没有写，本文将针对这一特性对`vue`和`react`做专门说明，希望同学看了以后能够受益匪浅，对你的项目能够有所帮助，本文借鉴了很多大佬的文章篇幅也是比较长的。

# 背景
单独项目中是希望根据登录人来看下这个人是不是有权限进入当前页面。虽然服务端做了进行接口的权限，但是每一个路由加载的时候都要去请求这个接口太浪费了。有时候是通过`SESSIONID`来校验登陆权限的。

在正式开始`react`路由鉴权之前我们先看一下vue的路由鉴权是如何工作的：

# 一、vue之beforeEach路由鉴权
>一般我们会相应的把路由表角色菜单配置在后端，当用户未通过页面菜单，直接从地址栏访问非权限范围内的`url`时，拦截用户访问并重定向到首页。

vue的初期是可以通过动态路由的方式，按照权限加载对应的路由表`AddRouter`，但是由于权限交叉，导致权限路由表要做判断结合，想想还是挺麻烦的，所以采用的是在`beforeEach`里面直判断用非动态路由的方式

> 在使用 `Vue`的时候，框架提供了路由守卫功能，用来在进入某个路有前进行一些校验工作，如果校验失败，就跳转到 404 或者登陆页面，比如 `Vue` 中的 `beforeEnter` 函数：

```javascript
...
router.beforeEach(async(to, from, next) => { 
    const toPath = to.path;    const fromPath = from.path;
})
...
```

## 1、路由概览
```javascript
// index.js
import Vue from 'vue'
import Router from 'vue-router'

import LabelMarket from './modules/label-market'
import PersonalCenter from './modules/personal-center'
import SystemSetting from './modules/system-setting'

import API from '@/utils/api'

Vue.use(Router)

const routes = [
  {
    path: '/label',
    component: () => import(/* webpackChunkName: "index" */ '@/views/index.vue'),
    redirect: { name: 'LabelMarket' },
    children: [
      { // 基础公共页面
        path: 'label-market',
        name: 'LabelMarket',
        component: () => import(/* webpackChunkName: "label-market" */ '@/components/page-layout/OneColLayout.vue'),
        redirect: { name: 'LabelMarketIndex' },
        children: LabelMarket
      },
      { // 个人中心
        path: 'personal-center',
        name: 'PersonalCenter',
        redirect: '/label/personal-center/my-apply',
        component: () => import(/* webpackChunkName: "personal-center" */ '@/components/page-layout/TwoColLayout.vue'),
        children: PersonalCenter
      },
      { // 系统设置
        path: 'system-setting',
        name: 'SystemSetting',
        redirect: '/label/system-setting/theme',
        component: () => import(/* webpackChunkName: "system-setting" */ '@/components/page-layout/TwoColLayout.vue'),
        children: SystemSetting
      }]
  },
  {
    path: '*',
    redirect: '/label'
  }
]

const router = new Router({ mode: 'history', routes })
// personal-center.js
export default [
    ...
  { // 我的审批
    path: 'my-approve',
    name: 'PersonalCenterMyApprove',
    component: () => import(/* webpackChunkName: "personal-center" */ '@/views/personal-center/index.vue'),
    children: [
      { // 数据服务审批
        path: 'api',
        name: 'PersonalCenterMyApproveApi',
        meta: {
          requireAuth: true,
          authRole: 'dataServiceAdmin'
        },
        component: () => import(/* webpackChunkName: "personal-center" */ '@/views/personal-center/api-approve/index.vue')
      },
      ...
    ]
  }
]
```
```javascript
export default [
    ...
  { // 数据服务设置
    path: 'api',
    name: 'SystemSettingApi',
    meta: {
      requireAuth: true,
      authRole: 'dataServiceAdmin'
    },
    component: () => import(/* webpackChunkName: "system-setting" */ '@/views/system-setting/api/index.vue')
  },
  { // 主题设置
    path: 'theme',
    name: 'SystemSettingTheme',
    meta: {
      requireAuth: true,
      authRole: 'topicAdmin'
    },
    component: () => import(/* webpackChunkName: "system-setting" */ '@/views/system-setting/theme/index.vue')
  },
    ...
]
```
## 2、鉴权判断

用户登陆信息请求后端接口，返回菜单、权限、版权信息等公共信息，存入vuex。此处用到权限字段如下：
```javascript
_userInfo: {    
    admin:false, // 是否超级管理员    
    dataServiceAdmin:true, // 是否数据服务管理员    
    topicAdmin:false // 是否主题管理员
}
```
1. 判断当前路由是否需要鉴权（router中meta字段下requireAuth是否为true），让公共页面直接放行；
2. 判断角色是超级管理员，直接放行；
3. （本系统特殊逻辑）判断跳转路径是主题设置但角色不为主题管理员，继续判断角色是否为数据服务管理员，跳转数据服务设置页or重定向（‘系统设置’菜单'/label/system-setting'默认重定向到'/label/system-setting/theme'，其他菜单默认重定向的都是基础公共页面，故需要对这里的重定向鉴权。系统设置的权限不是主题管理员就一定是数据服务管理员，所以能这样做）；
4. 判断路由需求权限是否符合，若不符合直接重定向。
```javascript
// index.js
router.beforeEach(async (to, from, next) => {
  try {
    // get user login info
    const _userInfo = await API.get('/common/query/menu', {}, false)
    router.app.$store.dispatch('setLoginUser', _userInfo)

    if (_userInfo && Object.keys(_userInfo).length > 0 &&
      to.matched.some(record => record.meta.requireAuth)) {
      if (_userInfo.admin) { // super admin can pass
        next()
      } else if (to.fullPath === '/label/system-setting/theme' &&
        !_userInfo.topicAdmin) {
        if (_userInfo.dataServiceAdmin) {
          next({ path: '/label/system-setting/api' })
        } else {
          next({ path: '/label' })
        }
      } else if (!(_userInfo[to.meta.authRole])) {
        next({ path: '/label' })
      }
    }
  } catch (e) {
    router.app.$message.error('获取用户登陆信息失败！')
  }
  next()
})
```
# 二、简介
## 1、路由简介

路由是干什么的？

根据不同的 url 地址展示不同的内容或页面。

单页面应用最大的特点就是只有一个 web 页面。因而所有的页面跳转都需要通过javascript实现。当需要根据用户操作展示不同的页面时，我们就需要根据访问路径使用js控制页面展示内容。

## 2、React-router 简介

React Router 是专为 React 设计的路由解决方案。它利用HTML5 的history API，来操作浏览器的 session history (会话历史)。

## 3、使用

React Router被拆分成四个包：react-router，react-router-dom，react-router-native和react-router-config。react-router提供核心的路由组件与函数。react-router-config用来配置静态路由（还在开发中），其余两个则提供了运行环境（浏览器与react-native）所需的特定组件。

进行网站（将会运行在浏览器环境中）构建，我们应当安装react-router-dom。因为react-router-dom已经暴露出react-router中暴露的对象与方法，因此你只需要安装并引用react-router-dom即可。

## 4、相关组件

### 4-1、

使用了 HTML5 的 history API (pushState, replaceState and the popstate event) 用于保证你的地址栏信息与界面保持一致。

主要属性:

basename：设置根路径

getUserConfirmation：获取用户确认的函数

forceRefresh：是否刷新整个页面

keyLength：location.key的长度

children：子节点（单个）

### 4-2、

为旧版本浏览器开发的组件，通常简易使用BrowserRouter。

### 4-3、

为项目提供声明性的、可访问的导航

主要属性:

to：可以是一个字符串表示目标路径，也可以是一个对象，包含四个属性：

pathname:表示指向的目标路径
search: 传递的搜索参数
hash:路径的hash值
state: 地址状态
replace：是否替换整个历史栈

innerRef：访问部件的底层引用

同时支持所有a标签的属性例如className，title等等

### 4-4、

React-router 中最重要的组件，最主要的职责就是根据匹配的路径渲染指定的组件

主要属性:

path：需要匹配的路径

component：需要渲染的组件

render：渲染组件的函数

children ：渲染组件的函数，常用在path无法匹配时呈现的’空’状态即所谓的默认显示状态

### 4-5、

重定向组件

主要属性: to:指向的路径

嵌套组件：唯一的渲染匹配路径的第一个子 或者

# 三、react-router-config之路由鉴权
## 引言

> 在之前的版本中，React Router 也提供了类似的 onEnter 钩子，但在 React Router 4.0 版本中，取消了这个方法。React Router 4.0 采用了声明式的组件，路由即组件，要实现路由守卫功能，就得我们自己去写了。

## 1、react-router-config 是一个帮助我们配置静态路由的小助手。其源码就是一个高阶函数 利用一个map函数生成静态路由

```javascript
import React from "react";
import Switch from "react-router/Switch";
import Route from "react-router/Route";
const renderRoutes = (routes, extraProps = {}, switchProps = {}) =>
routes ? (
    <Switch {...switchProps}>
        {routes.map((route, i) => ( 
        <Route
          key={route.key || i}
          path={route.path}
          exact={route.exact}
          strict={route.strict}
          render={props => (
            <route.component {...props} {...extraProps} route={route} />
          )}
        />
      ))}
    </Switch>
  ) : null;
 export default renderRoutes;
```
//router.js 假设这是我们设置的路由数组（这种写法和vue很相似是不是?)

```javascript
const routes = [
    { path: '/',
        exact: true,
        component: Home,
    },
    {
        path: '/login',
        component: Login,
    },
    {
        path: '/user',
        component: User,
    },
    {
        path: '*',
        component: NotFound
    }
]
```
//app.js 那么我们在app.js里这么使用就能帮我生成静态的路由了
```javascript
import { renderRoutes } from 'react-router-config'
import routes from './router.js'
const App = () => (
   <main>
      <Switch>
         {renderRoutes(routes)}
      </Switch>
   </main>
)

export default App
```

用过vue的小朋友都知道，vue的router.js 里面添加 meta: { requiresAuth: true }

然后利用导航守卫
```javascript
router.beforeEach((to, from, next) => {
  // 在每次路由进入之前判断requiresAuth的值，如果是true的话呢就先判断是否已登陆
})
```
## 2、基于类似vue的路由鉴权想法，我们稍稍改造一下react-router-config
```javascript
// utils/renderRoutes.js
import React from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
const renderRoutes = (routes, authed, authPath = '/login', extraProps = {}, switchProps = {}) => routes ? (
  <Switch {...switchProps}>
    {routes.map((route, i) => (
      <Route
        key={route.key || i}
        path={route.path}
        exact={route.exact}
        strict={route.strict}
        render={(props) => {
          if (!route.requiresAuth || authed || route.path === authPath) {
            return <route.component {...props} {...extraProps} route={route} />
          }
          return <Redirect to={{ pathname: authPath, state: { from: props.location } }} />
        }}
      />
    ))}
  </Switch>
) : null
export default renderRoutes
```
修改后的源码增加了两个参数 `authed `、`authPath` 和一个属性 `route.requiresAuth`

然后再来看一下最关键的一段代码
```javascript
if (!route.requiresAuth || authed || route.path === authPath) {
    return <route.component {...props} {...extraProps} route={route} />
    }
    return <Redirect to={{ pathname: authPath, state: { from: props.location } }} />
```
很简单 如果 `route.requiresAuth = false `或者 `authed = true `或者 `route.path === authPath`（参数默认值'/login'）则渲染我们页面，否则就渲染我们设置的`authPath`页面，并记录从哪个页面跳转。

相应的router.js也要稍微修改一下
```javascript
const routes = [
    { path: '/',
        exact: true,
        component: Home,
        requiresAuth: false,
    },
    {
        path: '/login',
        component: Login,
        requiresAuth: false,
    },
    {
        path: '/user',
        component: User,
        requiresAuth: true, //需要登陆后才能跳转的页面
    },
    {
        path: '*',
        component: NotFound,
        requiresAuth: false,
    }
]
```
//app.js
```javascript
import React from 'react'
import { Switch } from 'react-router-dom'
//import { renderRoutes } from 'react-router-config'
import renderRoutes from './utils/renderRoutes'
import routes from './router.js'
const authed = false // 如果登陆之后可以利用redux修改该值(关于redux不在我们这篇文章的讨论范围之内）
const authPath = '/login' // 默认未登录的时候返回的页面，可以自行设置
const App = () => (
   <main>
      <Switch>
         {renderRoutes(routes, authed, authPath)}
      </Switch>
   </main>
)
export default App
```
```javascript
//登陆之后返回原先要去的页面login函数
login(){
    const { from } = this.props.location.state || { from: { pathname: '/' } }
     // authed = true // 这部分逻辑自己写吧。。。
    this.props.history.push(from.pathname)
}
```
到此`react-router-config`就结束了并完成了我们想要的效果

## 3、注意⚠️

> 很多人会发现，有时候达不到我们想要的效果，那么怎么办呢，接着往下看
### 1、设计全局组建来管理是否登陆
configLogin.js
```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

class App extends Component {
  static propTypes = {
    children: PropTypes.object,
    location: PropTypes.object,
    isLogin: PropTypes.bool,
    history: PropTypes.object
  };
  componentDidMount () {
    if (!this.props.isLogin) {
      setTimeout(() => {
        this.props.history.push('/login')
      }, 300)
    }
    if (this.props.isLogin && this.props.location.pathname === '/login') {
      setTimeout(() => {
        this.props.history.push('/')
      }, 300)
    }
  }

  componentDidUpdate () {
    if (!this.props.isLogin) {
      setTimeout(() => {
        this.props.history.push('/login')
      }, 300)
    }
  }
  render () {
    return this.props.children
  }
}

export default withRouter(App)
```
通过在主路由模块index.js中引入
```javascript
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom'

<Router
   history={ history }
   basename="/"
   getUserConfirmation={ getConfirmation(history, 'yourCallBack') }
   forceRefresh={ !supportsHistory }
 >
  <App isLogin={ isLogin ? true : false }>
    <Switch>
     <Route
     exact
     path="/"
     render={ () => <Redirect to="/layout/dashboard" push /> }
     />
     <Route path="/login" component={ Login } />
     <Route path="/layout" component={ RootLayout } />
     <Route component={ NotFound } />
   </Switch>
  </App>
 </Router> 
```
很多时候我们是可以通过监听路由变化实现的比如`getUserConfirmation`钩子就是做这件事情的
```javascript
const getConfirmation = (message, callback) => {
  if (!isLogin) {
    message.push('/login')
  } else {
    message.push(message.location.pathname)
  }
```
接下来我们看一下`react-acl-router`又是怎么实现的

# 四、权限管理机制
本节参考代码：
> react-acl-router
> react-boilerplate-pro/src/app/init/router.js
> react-boilerplate-pro/src/app/config/routes.js

<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cbb2efc7f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

权限管理作为企业管理系统中非常核心的一个部分，一直以来因为业务方很多时候无法使用准确的术语来描述需求成为了困扰开发者们的一大难题。这里我们先来介绍两种常见的权限管理设计模式，即基于角色的访问控制以及访问控制列表。

## 1、布局与路由

在讨论具体的布局组件设计前，我们首先要解决一个更为基础的问题，那就是如何将布局组件与应用路由结合起来。

下面的这个例子是 `react-router `官方提供的侧边栏菜单与路由结合的例子，笔者这里做了一些简化：
```javascript
const SidebarExample = () => (
  <Router>
    <div style={{ display: "flex" }}>
      <div
        style={{
          padding: "10px",
          width: "40%",
          background: "#f0f0f0"
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0 }}>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/bubblegum">Bubblegum</Link>
          </li>
          <li>
            <Link to="/shoelaces">Shoelaces</Link>
          </li>
        </ul>
      </div>

      <div style={{ flex: 1, padding: "10px" }}>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            exact={route.exact}
            component={route.main}
          />
        ))}
      </div>
    </div>
  </Router>
);
```
抽象为布局的思想，写成简单的伪代码就是：
```javascript
<Router>
  <BasicLayout>                   // with sidebar
    {routes.map(route => (
      <Route {...route} />
    ))}
  </BasicLayout>
</Router>
```                     
这样的确是一种非常优雅的解决方案，但它的局限性在于无法支持多种不同的布局。受限于一个 Router 只能包含一个子组件，即使我们将多个布局组件包裹在一个容器组件中，如：
```javascript
<Router>
  <div>
    <BasicLayout>                 // with sidebar
      {routes.map(route => (
        <Route {...route} />
      )}
    </BasicLayout>
    <FlexLayout>                  // with footer
      {routes.map(route => (
        <Route {...route} />
      )}
    </FlexLayout>
  </div>
</Router>
```
路由在匹配到 FlexLayout 下的页面时，`BasicLayout` 中的 `sidebar` 也会同时显示出来，这显然不是我们想要的结果。换个思路，我们可不可以将布局组件当做 `children `直接传给更底层的` Route `组件呢？代码如下：
```javascript
<Router>
  <div>
    {basicLayoutRoutes.map(route => (
      <Route {...route}>
        <BasicLayout component={route.component} />
      </Route>
    ))}
    {flexLayoutRoutes.map(route => (
      <Route {...route}>
        <FlexLayout component={route.component} />
      </Route>
    ))}
  </div>
</Router>
```
这里我们将不同的布局组件当做高阶组件，相应地包裹在了不同的页面组件上，这样就实现了对多种不同布局的支持。还有一点需要注意的是，`react-router` 默认会将 `match、location、history` 等路由信息传递给 `Route` 的下一级组件，由于在上述方案中，`Route `的下一级组件并不是真正的页面组件而是布局组件，因而我们需要在布局组件中手动将这些路由信息传递给页面组件，或者统一改写 `Route` 的 `render `方法为：
```javascript
<Route
  render={props => (                 // props contains match, location, history
    <BasicLayout {...props}>          
      <PageComponent {...props} />
    </BasicLayout>
  )}
/>
```
另外一个可能会遇到的问题是，`connected-react-router` 并不会将路由中非常重要的 `match `对象（包含当前路由的 `params` 等数据 ）同步到 `redux store` 中，所以我们一定要保证布局及页面组件在路由部分就可以接收到 `match `对象，否则在后续处理页面页眉等与当前路由参数相关的需求时就会变得非常麻烦。

## 2、页眉 & 页脚

解决了与应用路由相结合的问题，具体到布局组件内部，其中最重要的两部分就是页面的页眉和页脚部分，而页眉又可以分为应用页眉与页面页眉两部分。

<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cbb3569f9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

应用页眉指的是整个应用层面的页眉，与具体的页面无关，一般来说会包含用户头像、通知栏、搜索框、多语言切换等这些应用级别的信息与操作。页面页眉则一般来讲会包含页面标题、面包屑导航、页面通用操作等与具体页面相关的内容。

在以往的项目中，尤其是在项目初期许多开发者因为对项目本身还没有一个整体的认识，很多时候会倾向于将应用页眉做成一个展示型组件并在不同的页面中直接调用。这样做当然有其方便之处，比如说页面与布局之间的数据同步环节就被省略掉了，每个页面都可以直接向页眉传递自己内部的数据。

但从理想的项目架构角度来讲这样做却是一个`反模式（anti-pattern）`。因为应用页眉实际是一个应用级别的组件，但按照上述做法的话却变成了一个页面级别的组件，伪代码如下：
```javascript
<App>
  <BasicLayout>
    <PageA>
      <AppHeader title="Page A" />
    </PageA>
  </BasicLayout>
  <BasicLayout>
    <PageB>
      <AppHeader title="Page B" />
    </PageB>
  </BasicLayout>
</App>
```
从应用数据流的角度来讲也存在着同样的问题，那就是应用页眉应该是向不同的页面去传递数据的，而不是反过来去接收来自页面的数据。这导致应用页眉丧失了控制自己何时 `rerender`（重绘) 的机会，作为一个纯展示型组件，一旦接收到的 props 发生变化页眉就需要进行一次重绘。

另一方面，除了通用的应用页眉外，页面页眉与页面路由之间是有着严格的一一对应的关系的，那么我们能不能将页面页眉部分的配置也做到路由配置中去，以达到新增加一个页面时只需要在` config/routes.js` 中多配置一个路由对象就可以完成页面页眉部分的创建呢？理想情况下的伪代码如下：
```javascript
<App>
  <BasicLayout>                    // with app & page header already
    <PageA />
  </BasicLayout>
  <BasicLayout>
    <PageB />
  </BasicLayout>
</App>
```
### 1、配置优于代码

在过去关于组件库的讨论中我们曾经得出过代码优于配置的结论，即需要使用者自定义的部分，应该尽量抛出回调函数让使用者可以使用代码去控制自定义的需求。这是因为组件作为极细粒度上的抽象，配置式的使用模式往往很难满足使用者多变的需求。但在企业管理系统中，作为一个应用级别的解决方案，能使用配置项解决的问题我们都应该尽量避免让使用者编写代码。

配置项（配置文件）天然就是一种集中式的管理模式，可以极大地降低应用复杂度。以页眉为例来说，如果我们每个页面文件中都调用了页眉组件，那么一旦页眉组件出现问题我们就需要修改所有用到页眉组件页面的代码。除去 debug 的情况外，哪怕只是修改一个页面标题这样简单的需求，开发者也需要先找到这个页面相对应的文件，并在其 render 函数中进行修改。这些隐性成本都是我们在设计企业管理系统解决方案时需要注意的，因为就是这样一个个的小细节造成了本身并不复杂的企业管理系统在维护、迭代了一段时间后应用复杂度陡增。理想情况下，一个优秀的企业管理系统解决方案应该可以做到 80% 以上非功能性需求变更都可以使用修改配置文件的方式解决。

2、配置式页眉

<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cbb27f584?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

```javascript
import { matchRoutes } from 'react-router-config';

// routes config
const routes = [{
  path: '/outlets',
  exact: true,
  permissions: ['admin', 'user'],
  component: Outlets,
  unauthorized: Unauthorized,
  pageTitle: '门店管理',
  breadcrumb: ['/outlets'],
}, {
  path: '/outlets/:id',
  exact: true,
  permissions: ['admin', 'user'],
  component: OutletDetail,
  unauthorized: Unauthorized,
  pageTitle: '门店详情',
  breadcrumb: ['/outlets', '/outlets/:id'],
}];

// find current route object
const pathname = get(state, 'router.location.pathname', '');
const { route } = head((matchRoutes(routes, pathname)));
```
基于这样一种思路，我们可以在通用的布局组件中根据当前页面的 pathname 使用 react-router-config 提供的 matchRoutes 方法来获取到当前页面 route 对象的所有配置项，也就意味着我们可以对所有的这些配置项做统一的处理。这不仅为处理通用逻辑带来了方便，同时对于编写页面代码的同事来说也是一种约束，能够让不同开发者写出的代码带有更少的个人色彩，方便对于代码库的整体管理。

## 3、页面标题

```javascript
renderPageHeader = () => {
  const { prefixCls, route: { pageTitle }, intl } = this.props;

  if (isEmpty(pageTitle)) {
    return null;
  }

  const pageTitleStr = intl.formatMessage({ id: pageTitle });
  return (
    <div className={`${prefixCls}-pageHeader`}>
      {this.renderBreadcrumb()}
      <div className={`${prefixCls}-pageTitle`}>{pageTitleStr}</div>
    </div>
  );
}
```
## 4、面包屑导航
```javascript
renderBreadcrumb = () => {
  const { route: { breadcrumb }, intl, prefixCls } = this.props;
  const breadcrumbData = generateBreadcrumb(breadcrumb);

  return (
    <Breadcrumb className={`${prefixCls}-breadcrumb`}>
      {map(breadcrumbData, (item, idx) => (
        idx === breadcrumbData.length - 1 ?
          <Breadcrumb.Item key={item.href}>
            {intl.formatMessage({ id: item.text })}
          </Breadcrumb.Item>
          :
          <Breadcrumb.Item key={item.href}>
            <Link href={item.href} to={item.href}>
              {intl.formatMessage({ id: item.text })}
            </Link>
          </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
}
```
## 3、设计策略

### 1、基于角色的访问控制

基于角色的访问控制不直接将系统操作的各种权限赋予具体用户，而是在用户与权限之间建立起角色集合，将权限赋予角色再将角色赋予用户。这样就实现了对于权限和角色的集中管理，避免用户与权限之间直接产生复杂的多对多关系。

### 2、访问控制列表

具体到角色与权限之间，访问控制列表指代的是某个角色所拥有的系统权限列表。在传统计算机科学中，权限一般指的是对于文件系统进行增删改查的权力。而在 Web 应用中，大部分系统只需要做到页面级别的权限控制即可，简单来说就是根据当前用户的角色来决定其是否拥有查看当前页面的权利。

下面就让我们按照这样的思路实现一个基础版的包含权限管理功能的应用路由。

## 4、实战代码

### 1、路由容器

在编写权限管理相关的代码前，我们需要先为所有的页面路由找到一个合适的容器，即 react-router 中的 Switch 组件。与多个独立路由不同的是，包裹在 Switch 中的路由每次只会渲染路径匹配成功的第一个，而不是所有符合路径匹配条件的路由。
```javascript
<Router>
  <Route path="/about" component={About}/>
  <Route path="/:user" component={User}/>
  <Route component={NoMatch}/>
</Router>
```
```javascript
<Router>
  <Switch>
    <Route path="/about" component={About}/>
    <Route path="/:user" component={User}/>
    <Route component={NoMatch}/>
  </Switch>
</Router>
```
以上面两段代码为例，如果当前页面路径是 `/about `的话，因为 、 及 这三个路由的路径都符合 `/about`，所以它们会同时被渲染在当前页面。而将它们包裹在 `Switch `中后，`react-router` 在找到第一个符合条件的 路由后就会停止查找直接渲染 组件。

在企业管理系统中因为页面与页面之间一般都是平行且排他的关系，所以利用好 `Switch` 这个特性对于我们简化页面渲染逻辑有着极大的帮助。

另外值得一提的是，在 `react-router `作者 `Ryan Florence `的新作 `@reach/router `中，`Switch `的这一特性被默认包含了进去，而且 `@reach/router` 会自动匹配最符合当前路径的路由。这就使得使用者不必再去担心路由的书写顺序，感兴趣的朋友可以关注一下。

### 2、权限管理

现在我们的路由已经有了一个大体的框架，下面就让我们为其添加具体的权限判断逻辑。

对于一个应用来说，除去需要鉴权的页面外，一定还存在着不需要鉴权的页面，让我们先将这些页面添加到我们的路由中，如登录页。
```javascript
<Router>
  <Switch>
    <Route path="/login" component={Login}/>
  </Switch>
</Router>
```
对于需要鉴权的路由，我们需要先抽象出一个判断当前用户是否有权限的函数来作为判断依据，而根据具体的需求，用户可以拥有单个角色或多个角色，抑或更复杂的一个鉴权函数。这里笔者提供一个最基础的版本，即我们将用户的角色以字符串的形式存储在后台，如一个用户的角色是 admin，另一个用户的角色是 user。
```javascript
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import indexOf from 'lodash/indexOf';

const checkPermissions = (authorities, permissions) => {
  if (isEmpty(permissions)) {
    return true;
  }

  if (isArray(authorities)) {
    for (let i = 0; i < authorities.length; i += 1) {
      if (indexOf(permissions, authorities[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  if (isString(authorities)) {
    return indexOf(permissions, authorities) !== -1;
  }

  if (isFunction(authorities)) {
    return authorities(permissions);
  }

  throw new Error('[react-acl-router]: Unsupport type of authorities.');
};

export default checkPermissions;
```
在上面我们提到了路由的配置文件，这里我们为每一个需要鉴权的路由再添加一个属性 `permissions`，即哪些角色可以访问该页面。
```javascript
const routes = [{
  path: '/outlets',
  exact: true,
  permissions: ['admin', 'user'],
  component: Outlets,
  unauthorized: Unauthorized,
  pageTitle: 'Outlet Management',
  breadcrumb: ['/outlets'],
}, {
  path: '/outlets/:id',
  exact: true,
  permissions: ['admin'],
  component: OutletDetail,
  redirect: '/',
  pageTitle: 'Outlet Detail',
  breadcrumb: ['/outlets', '/outlets/:id'],
}];
```
在上面的配置中，`admin `和 `user` 都可以访问门店列表页面，但只有 `admin `才可以访问门店详情页面。

<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cbb9978ce?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

对于没有权限查看当前页面的情况，一般来讲有两种处理方式，一是直接重定向到另一个页面（如首页），二是渲染一个无权限页面，提示用户因为没有当前页面的权限所以无法查看。二者是排他的，即每个页面只需要使用其中一种即可，于是我们在路由配置中可以根据需要去配置 `redirect `或 `unauthorized `属性，分别对应无权限重定向及无权限显示无权限页面两种处理方式。具体代码大家可以参考示例项目` react-acl-router `中的实现，这里摘录一小段核心部分。
```javascript
renderRedirectRoute = route => (
  <Route
    key={route.path}
    {...omitRouteRenderProperties(route)}
    render={() => <Redirect to={route.redirect} />}
  />
);

renderAuthorizedRoute = (route) => {
  const { authorizedLayout: AuthorizedLayout } = this.props;
  const { authorities } = this.state;
  const {
    permissions,
    path,
    component: RouteComponent,
    unauthorized: Unauthorized,
  } = route;
  const hasPermission = checkPermissions(authorities, permissions);

  if (!hasPermission && route.unauthorized) {
    return (
      <Route
        key={path}
        {...omitRouteRenderProperties(route)}
        render={props => (
          <AuthorizedLayout {...props}>
            <Unauthorized {...props} />
          </AuthorizedLayout>
        )}
      />
    );
  }

  if (!hasPermission && route.redirect) {
    return this.renderRedirectRoute(route);
  }

  return (
    <Route
      key={path}
      {...omitRouteRenderProperties(route)}
      render={props => (
        <AuthorizedLayout {...props}>
          <RouteComponent {...props} />
        </AuthorizedLayout>
      )}
    />
  );
}
```
于是，在最终的路由中，我们会优先匹配无需鉴权的页面路径，保证所有用户在访问无需鉴权的页面时，第一时间就可以看到页面。然后再去匹配需要鉴权的页面路径，最终如果所有的路径都匹配不到的话，再渲染 `404 `页面告知用户当前页面路径不存在。
<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cbb875252?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

```javascript
<Switch>
  {map(normalRoutes, route => (
    this.renderNormalRoute(route)
  ))}
  {map(authorizedRoutes, route => (
    this.renderAuthorizedRoute(route)
  ))}
  {this.renderNotFoundRoute()}
</Switch>
```
需要鉴权的路由和不需要鉴权的路由作为两种不同的页面，一般而言它们的页面布局也是不同的。如登录页面使用的就是普通页面布局：
<img src="https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8ce97db89d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

在这里我们可以将不同的页面布局与鉴权逻辑相结合以达到只需要在路由配置中配置相应的属性，新增加的页面就可以同时获得鉴权逻辑和基础布局的效果。这将极大地提升开发者们的工作效率，尤其是对于项目组的新成员来说纯配置的上手方式是最友好的。

### 5、应用集成

至此一个包含基础权限管理的应用路由就大功告成了，我们可以将它抽象为一个独立的路由组件，使用时只需要配置需要鉴权的路由和不需要鉴权的路由两部分即可。
```javascript
const authorizedRoutes = [{
  path: '/outlets',
  exact: true,
  permissions: ['admin', 'user'],
  component: Outlets,
  unauthorized: Unauthorized,
  pageTitle: 'pageTitle_outlets',
  breadcrumb: ['/outlets'],
}, {
  path: '/outlets/:id',
  exact: true,
  permissions: ['admin', 'user'],
  component: OutletDetail,
  unauthorized: Unauthorized,
  pageTitle: 'pageTitle_outletDetail',
  breadcrumb: ['/outlets', '/outlets/:id'],
}, {
  path: '/exception/403',
  exact: true,
  permissions: ['god'],
  component: WorkInProgress,
  unauthorized: Unauthorized,
}];

const normalRoutes = [{
  path: '/',
  exact: true,
  redirect: '/outlets',
}, {
  path: '/login',
  exact: true,
  component: Login,
}];

const Router = props => (
  <ConnectedRouter history={props.history}>
    <MultiIntlProvider
      defaultLocale={locale}
      messageMap={messages}
    >
      // the router component
      <AclRouter
        authorities={props.user.authorities}
        authorizedRoutes={authorizedRoutes}
        authorizedLayout={BasicLayout}
        normalRoutes={normalRoutes}
        normalLayout={NormalLayout}
        notFound={NotFound}
      />
    </MultiIntlProvider>
  </ConnectedRouter>
);

const mapStateToProps = state => ({
  user: state.app.user,
});

Router.propTypes = propTypes;
export default connect(mapStateToProps)(Router);
```
在实际项目中，我们可以使用 `react-redux `提供的 `connect `组件将应用路由 `connect` 至 `redux store`，以方便我们直接读取当前用户的角色信息。一旦登录用户的角色发生变化，客户端路由就可以进行相应的判断与响应。

### 6、组合式开发：权限管理

对于页面级别的权限管理来说，权限管理部分的逻辑是独立于页面的，是与页面中的具体内容无关的。也就是说，权限管理部分的代码并不应该成为页面中的一部分，而是应该在拿到用户权限后创建应用路由时就将没有权限的页面替换为重定向或无权限页面。

这样一来，页面部分的代码就可以实现与权限管理逻辑的彻底解耦，以至于如果抽掉权限管理这一层后，页面就变成了一个无需权限判断的页面依然可以独立运行。而通用部分的权限管理代码也可以在根据业务需求微调后服务于更多的项目。

### 7、小结

文中我们从权限管理的基础设计思想讲起，实现了一套基于角色的页面级别的应用权限管理系统并分别讨论了无权限重定向及无权限显示无权限页面两种无权限查看时的处理方法。

接下来我们来看一下多级菜单是如何实现的

# 五、菜单匹配逻辑
本节参考代码：
> react-sider: https://github.com/AlanWei/react-sider

<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cef1a44ab?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

在大部分企业管理系统中，页面的基础布局所采取的一般都是侧边栏菜单加页面内容这样的组织形式。在成熟的组件库支持下，UI 层面想要做出一个漂亮的侧边栏菜单并不困难，但因为在企业管理系统中菜单还承担着页面导航的功能，于是就导致了两大难题，一是多级菜单如何处理，二是菜单项的子页面（如点击门店管理中的某一个门店进入的门店详情页在菜单中并没有对应的菜单项）如何高亮其隶属于的父级菜单。

## 1、多级菜单

为了增强系统的可扩展性，企业管理系统中的菜单一般都需要提供多级支持，对应的数据结构就是在每一个菜单项中都要有 children 属性来配置下一级菜单项。
```javascript
const menuData = [{
  name: '仪表盘',
  icon: 'dashboard',
  path: 'dashboard',
  children: [{
    name: '分析页',
    path: 'analysis',
    children: [{
      name: '实时数据',
      path: 'realtime',
    }, {
      name: '离线数据',
      path: 'offline',
    }],
  }],
}];
```
* 递归渲染父菜单及子菜单

想要支持多级菜单，首先要解决的问题就是如何统一不同级别菜单项的交互。

在大多数的情况下，每一个菜单项都代表着一个不同的页面路径，点击后会触发 url 的变化并跳转至相应页面，也就是上面配置中的 path 字段。
<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8ce9f24572?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

但对于一个父菜单来说，点击还意味着打开或关闭相应的子菜单，这就与点击跳转页面发生了冲突。为了简化这个问题，我们先统一菜单的交互为点击父菜单（包含 children 属性的菜单项）为打开或关闭子菜单，点击子菜单（不包含 children 属性的菜单项）为跳转至相应页面。

首先，为了成功地渲染多级菜单，菜单的渲染函数是需要支持递归的，即如果当前菜单项含有 children 属性就将其渲染为父菜单并优先渲染其 children 字段下的子菜单，这在算法上被叫做深度优先遍历。
```javascript
renderMenu = data => (
  map(data, (item) => {
    if (item.children) {
      return (
        <SubMenu
          key={item.path}
          title={
            <span>
              <Icon type={item.icon} />
              <span>{item.name}</span>
            </span>
          }
        >
          {this.renderMenu(item.children)}
        </SubMenu>
      );
    }

    return (
      <Menu.Item key={item.path}>
        <Link to={item.path} href={item.path}>
          <Icon type={item.icon} />
          <span>{item.name}</span>
        </Link>
      </Menu.Item>
    );
  })
)
```
这样我们就拥有了一个支持多级展开、子菜单分别对应页面路由的侧边栏菜单。细心的朋友可能还发现了，虽然父菜单并不对应一个具体的路由但在配置项中依然还有 path 这个属性，这是为什么呢？

## 2、处理菜单高亮

在传统的企业管理系统中，为不同的页面配置页面路径是一件非常痛苦的事情，对于页面路径，许多开发者唯一的要求就是不重复即可，如上面的例子中，我们把菜单数据配置成这样也是可以的。
```javascript
const menuData = [{
  name: '仪表盘',
  icon: 'dashboard',
  children: [{
    name: '分析页',
    children: [{
      name: '实时数据',
      path: '/realtime',
    }, {
      name: '离线数据',
      path: '/offline',
    }],
  }],
}];

<Router>
  <Route path="/realtime" render={() => <div />}
  <Route path="/offline" render={() => <div />}
</Router>
```
用户在点击菜单项时一样可以正确地跳转到相应页面。但这样做的一个致命缺陷就是，对于 `/realtime` 这样一个路由，如果只根据当前的 `pathname `去匹配菜单项中 `path `属性的话，要怎样才能同时也匹配到「分析页」与「仪表盘」呢？因为如果匹配不到的话，「分析页」和「仪表盘」就不会被高亮了。我们能不能在页面的路径中直接体现出菜单项之间的继承关系呢？来看下面这个工具函数。
```javascript
import map from 'lodash/map';

const formatMenuPath = (data, parentPath = '/') => (
  map(data, (item) => {
    const result = {
      ...item,
      path: `${parentPath}${item.path}`,
    };
    if (item.children) {
      result.children = formatMenuPath(item.children, `${parentPath}${item.path}/`);
    }
    return result;
  })
);
```
这个工具函数把菜单项中可能有的 children 字段考虑了进去，将一开始的菜单数据传入就可以得到如下完整的菜单数据。
```javascript
[{
  name: '仪表盘',
  icon: 'dashboard',
  path: '/dashboard',  // before is 'dashboard'
  children: [{
    name: '分析页',
    path: '/dashboard/analysis', // before is 'analysis'
    children: [{
      name: '实时数据',
      path: '/dashboard/analysis/realtime', // before is 'realtime'
    }, {
      name: '离线数据',
      path: '/dashboard/analysis/offline', // before is 'offline'
    }],
  }],
}];
```
然后让我们再对当前页面的路由做一下逆向推导，即假设当前页面的路由为 `/dashboard/analysis/realtime`，我们希望可以同时匹配到 `['/dashboard', '/dashboard/analysis', '/dashboard/analysis/realtime']`，方法如下：
```javascript
import map from 'lodash/map';

const urlToList = (url) => {
  if (url) {
    const urlList = url.split('/').filter(i => i);
    return map(urlList, (urlItem, index) => `/${urlList.slice(0, index + 1).join('/')}`);
  }
  return [];
};
```
上面的这个数组代表着不同级别的菜单项，将这三个值分别与菜单数据中的` path` 属性进行匹配就可以一次性地匹配到所有当前页面应当被高亮的菜单项了。

这里需要注意的是，虽然菜单项中的` path `一般都是普通字符串，但有些特殊的路由也可能是正则的形式，如` /outlets/:id`。所以我们在对二者进行匹配时，还需要引入 `path-to-regexp` 这个库来处理类似` /outlets/1 `和 `/outlets/:id `这样的路径。又因为初始时菜单数据是树形结构的，不利于进行 `path` 属性的匹配，所以我们还需要先将树形结构的菜单数据扁平化，然后再传入 `getMeunMatchKeys `中。
```javascript
import pathToRegexp from 'path-to-regexp';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';

const getFlatMenuKeys = menuData => (
  reduce(menuData, (keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, [])
);

const getMeunMatchKeys = (flatMenuKeys, paths) =>
  reduce(paths, (matchKeys, path) => (
    matchKeys.concat(filter(flatMenuKeys, item => pathToRegexp(item).test(path)))
  ), []);
```
在这些工具函数的帮助下，多级菜单的高亮也不再是问题了。

## 3、知识点：记忆化（Memoization）

在侧边栏菜单中，有两个重要的状态：一个是 `selectedKeys`，即当前选定的菜单项；另一个是 `openKeys`，即多个多级菜单的打开状态。这二者的含义是不同的，因为在 `selectedKeys` 不变的情况下，用户在打开或关闭其他多级菜单后，`openKeys` 是会发生变化的，如下面二图所示，`selectedKeys `相同但 `openKeys` 不同。
<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8d00e70fdb?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cf0cbaff1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>


对于` selectedKeys `来说，由于它是由页面路径（`pathname`）决定的，所以每一次 `pathname` 发生变化都需要重新计算 `selectedKeys `的值。又因为通过 `pathname` 以及最基础的菜单数据 `menuData` 去计算 `selectedKeys` 是一件非常昂贵的事情（要做许多数据格式处理和计算），有没有什么办法可以优化一下这个过程呢？

`Memoization` 可以赋予普通函数记忆输出结果的功能，它会在每次调用函数之前检查传入的参数是否与之前执行过的参数完全相同，如果完全相同则直接返回上次计算过的结果，就像常用的缓存一样。
```javascript
import memoize from 'memoize-one';

constructor(props) {
  super(props);

  this.fullPathMenuData = memoize(menuData => formatMenuPath(menuData));
  this.selectedKeys = memoize((pathname, fullPathMenu) => (
    getMeunMatchKeys(getFlatMenuKeys(fullPathMenu), urlToList(pathname))
  ));

  const { pathname, menuData } = props;

  this.state = {
    openKeys: this.selectedKeys(pathname, this.fullPathMenuData(menuData)),
  };
}
```
在组件的构造器中我们可以根据当前 `props `传来的 `pathname `及 `menuData `计算出当前的` selectedKeys `并将其当做 `openKeys `的初始值初始化组件内部` state`。因为 `openKeys `是由用户所控制的，所以对于后续 `openKeys `值的更新我们只需要配置相应的回调将其交给 `Menu` 组件控制即可。
```javascript
import Menu from 'antd/lib/menu';

handleOpenChange = (openKeys) => {
  this.setState({
    openKeys,
  });
};

<Menu
  style={{ padding: '16px 0', width: '100%' }}
  mode="inline"
  theme="dark"
  openKeys={openKeys}
  selectedKeys={this.selectedKeys(pathname, this.fullPathMenuData(menuData))}
  onOpenChange={this.handleOpenChange}
>
  {this.renderMenu(this.fullPathMenuData(menuData))}
</Menu>
```
这样我们就实现了对于` selectedKeys` 及` openKeys` 的分别管理，开发者在使用侧边栏组件时只需要将应用当前的页面路径同步到侧边栏组件中的 pathname 属性即可，侧边栏组件会自动处理相应的菜单高亮`（selectedKeys）`和多级菜单的打开与关闭（`openKeys`）。

## 4、知识点：正确区分 prop 与 state

上述这个场景也是一个非常经典的关于如何正确区分 `prop` 与` state `的例子。

`selectedKeys` 由传入的 `pathname` 决定，于是我们就可以将` selectedKeys` 与 `pathname` 之间的转换关系封装在组件中，使用者只需要传入正确的 `pathname` 就可以获得相应的` selectedKeys `而不需要关心它们之间的转换是如何完成的。而 `pathname `作为组件渲染所需的基础数据，组件无法从自身内部获得，所以就需要使用者通过` props` 将其传入进来。

另一方面，` openKeys `作为组件内部的 `state`，初始值可以由` pathname `计算而来，后续的更新则与组件外部的数据无关而是会根据用户的操作在组件内部完成，那么它就是一个` state`，与其相关的所有逻辑都可以彻底地被封装在组件内部而不需要暴露给使用者。

简而言之，一个数据如果想成为` prop` 就必须是组件内部无法获得的，而且在它成为了 `prop `之后，所有可以根据它的值推导出来的数据都不再需要成为另外的 `props`，否则将违背 `React `单一数据源的原则。对于` state `来说也是同样，如果一个数据想成为 `state`，那么它就不应该再能够被组件外部的值所改变，否则也会违背单一数据源的原则而导致组件的表现不可预测，产生难解的 bug。

## 5、组合式开发：应用菜单

严格来说，在这一小节中着重探讨的应用菜单部分的思路并不属于组合式开发思想的范畴，更多地是如何写出一个支持无限级子菜单及自动匹配当前路由的菜单组件。组件当然是可以随意插拔的，但前提是应用该组件的父级部分不依赖于组件所提供的信息。这也是我们在编写组件时所应当遵循的一个规范，即组件可以从外界获取信息并在此基础上进行组件内部的逻辑判断。但当组件向其外界抛出信息时，更多的时候应该是以回调的形式让调用者去主动触发，然后更新外部的数据再以 `props` 的形式传递给组件以达到更新组件的目的，而不是强制需要在外部再配置一个回调的接收函数去直接改变组件的内部状态。

从这点上来说，组合式开发与组件封装其实是有着异曲同工之妙的，关键都在于对内部状态的严格控制。不论一个模块或一个组件需要向外暴露多少接口，在它的内部都应该是解决了某一个或某几个具体问题的。就像工厂产品生产流水线上的一个环节，在经过了这一环节后产品相较于进入前一定产生了某种区别，不论是增加了某些功能还是被打上某些标签，产品一定会变得更利于下游合作者使用。更理想的情况则是即使删除掉了这一环节，原来这一环节的上下游依然可以无缝地衔接在一起继续工作，这就是我们所说的模块或者说组件的可插拔性。

# 六、后端路由服务的意义
在前后端分离架构的背景下，前端已经逐渐代替后端接管了所有固定路由的判断与处理，但在动态路由这样一个场景下，我们会发现单纯前端路由服务的灵活度是远远不够的。在用户到达某个页面后，可供下一步逻辑判断的依据就只有当前页面的 url，而根据 url 后端的路由服务是可以返回非常丰富的数据的。

常见的例子如页面的类型。假设应用中营销页和互动页的渲染逻辑并不相同，那么在页面的 DSL 数据之外，我们就还需要获取到页面的类型以进行相应的渲染。再比如页面的 SEO 数据，创建和更新时间等等，这些数据都对应用能够在前端灵活地展示页面，处理业务逻辑有着巨大的帮助。

甚至我们还可以推而广之，彻底抛弃掉由 react-router 等提供的前端路由服务，转而写一套自己的路由分发器，即根据页面类型的不同分别调用不同的页面渲染服务，以多种类型页面的方式来组成一个完整的前端应用。

# 七、组合式开发
为了解决大而全的方案在实践中不够灵活的问题，我们是不是可以将其中包含的各个模块解耦后，独立发布出来供开发者们按需取用呢？让我们先来看一段理想中完整的企业管理系统应用架构部分的伪代码：
```javascript
const App = props => (
  <Provider>                                        // react-redux bind
    <ConnectedRouter>                               // react-router-redux bind
      <MultiIntlProvider>                           // intl support
        <AclRouter>                                 // router with access control list
          <Route path="/login">                     // route that doesn't need authentication
            <NormalLayout>                          // layout component
              <View />                              // page content (view component)
            </NormalLayout>
          <Route path="/login">
          ...                                       // more routes that don't need authentication
          <Route path="/analysis">                  // route that needs authentication
            <LoginChecker>                          // hoc for user login check
              <BasicLayout>                         // layout component
                <SiderMenu />                       // sider menu
                <Content>
                  <PageHeader />                    // page header
                  <View />                          // page content (view component)
                  <PageFooter />                    // page footer
                </Content>
              </BasicLayout>
            </LoginChecker>
          </Route>
          ...                                       // more routes that need authentication
          <Route render={() => <div>404</div>} />   // 404 page
        </AclRouter>
      </MultiIntlProvider>
    </ConnectedRouter>
  </Provider>
);
```
在上面的这段伪代码中，我们抽象出了多语言支持、基于路由的权限管理、登录鉴权、基础布局、侧边栏菜单等多个独立模块，可以根据需求添加或删除任意一个模块，而且添加或删除任意一个模块都不会对应用的其他部分产生不可接受的副作用。这让我们对接下来要做的事情有了一个大体的认识，但在具体的实践中，如 `props` 如何传递、模块之间如何共享数据、如何灵活地让用户自定义某些特殊逻辑等都仍然面临着巨大的挑战。我们需要时刻注意，在处理一个具体问题时哪些部分应当放在某个独立模块内部去处理，哪些部分应当暴露出接口供使用者自定义，模块与模块之间如何做到零耦合以至于使用者可以随意插拔任意一个模块去适应当前项目的需要。

# 八、学习路线
从一个具体的前端应用直接切入开发技巧与理念的讲解，所以对于刚入门 React 的朋友来说可能存在着一定的基础知识部分梳理的缺失，这里为大家提供一份较为详细的 React 开发者学习路线图，希望能够为刚入门 React 的朋友提供一条规范且便捷的学习之路。
<img src='https://user-gold-cdn.xitu.io/2019/8/26/16ccbf8cf8c6a846?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

# 总结
到此react的路由鉴权映梳理完了欢迎大家转发交流分享转载请注明出处 ，附带一个近期相关项目案例代码给大家一个思路：
> https://github.com/leishihong/react-router-config
