Redux 是 React 框架下的一款状态管理工具，可以实现多个组件之间的数据共享和传递。学习和掌握 Redux 以及周边生态可以使我们更好的进行 React 项目开发。下面我们就详细的讲述 Redux 在实际项目开发中的使用。

# Redux 基本使用

## 简单使用

- 1、创建`store`及`reducer`

```javascript
// store/reducer.js
// 创建reducer
const defaultState = { a : "" }
export default ( state = defaultState , action ) => {
  return state ;
}
// store/index.js
// 创建store
import { createStore } from "redux";
import reducer from "./reducer.js";
const store = createStore( reducer );
export default store;
```

- 2、 在组件中获取`store`中的数据

```javascript
// todoList.js
this.state = store.getState()
```

- 3、 请求修改`store`中的数据

```javascript
// todoList.js
const action = {
  type : "CHANGE_INPUT_VALUE",
  a: 123;
}
store.dispatch( action )
```

- 4、 `store`收到修改请求后在`reducer`中执行修改

```javascript
// reducer.js
const defaultState = { a : "" };
export default ( state = defaultState , action ) => {
  if ( action.type === "CHANGE_INPUT_VALUE" ) {
    const newState = JSON.parse(JSON.stringify( state );
    newState.a = action.a;
    return newState;
  }
  return state ;
}
```

- 5、在组件中监听到`store`数据发生变化后触发回调方法重新获取`store`数据来更新组件数据。

```javascript
// todoList.js
// 监听store中数据发生变化
store.subscribe( this.handleStoreChange)
// 执行回调更新组件数据
handleStoreChange() {
this.setState(store.getState());
}
```

## 项目使用示例

```javascript
|- store
  |- index.js
    import { createStore } from "redux";
    import reducer from "./reducer.js";
    const store = createStore(reducer);
    export default store;
  |- reducer.js
    import { CHANGE_INPUT_VALUE } from "actionTypes";
    const defaultState = { inputValue: "" };
    export default ( state = defaultState , action ) => {
      if ( action.type === "CHANGE_INPUT_VALUE" ) {
        const newState = JSON.parse(JSON.stringify( state );
        newState. inputValue = action.inputValue;
          return newState;
        }
        return state ;
      }
  |- actionTypes.js
    export const CHANGE_INPUT_VALUE = "change_input_value";
  |- actionCreators.js
    import { CHANGE_INPUT_VALUE } from "actionTypes";
    export const getInputChangeAction = (value) => {
      type: CHANGE_INPUT_VALUE,
      value
    }
|- todoList.js
    import React , { Component } from "react";
    import store from "./store";
    import { getInputChangeAction } from "./store/actionCreators";
    class TodoList extends Component {
      constructor( props ) {
        super( props );
        this.state = store.getState();
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleStoreChange = this.handleStoreChange.bind(this);
        store.subscribe(this.handleStoreChange);
      }
      render() {
        return (
          <input
            value={this.state.inputValue}
            onChange={this.handleInputChange}/>
        )
      }
      handleInputChange(e) {
        const action = getInputChangeAction(e.target.value);
        store.dispatch(action);
      }
      handleStoreChange() {
        this.setState(store.getState());
      }
    }
```
# Redux 的中间件

为了近一步丰富`Redux`生态，围绕着`Redux`周边有很多第三方中间件。其中为了使`Redux`更好的提供异步操作的支持，有两个比较常用的中间件`Redux-thunk`和`Redux-saga`。

## 写在使用之前

### 一点疑惑 ？

在使用`Redux-thunk`和`Redux-saga`之前，一直有一个困扰我的地方，那就是：

我们为什么要在`React`项目中使用类似于`Redux-thunk`这样的中间件？
它能给我们带来什么好处？

`Redux-thunk`官方仓库这样介绍：

> With a plain basic Redux store, you can only do simple synchronous updates by dispatching an action. Middleware extend the store's abilities, and let you write async logic that interacts with the store.Thunks are the recommended middleware for basic Redux side effects logic, including complex synchronous logic that needs access to the store, and simple async logic like AJAX requests.

意思是说：

> 基础的`Redux store`只能通过派发`action`来同步的更新数据，中间件扩展了`store`的能力，你可以书写异步逻辑来影响`store`。在需要在`store`中处理复杂的同步逻辑和异步逻辑的时候，`Thunks`是被推荐的中间件。

这点解释并不能打消我的疑虑......

- 1、在需要异步更新`store`的数据的时候，我可以在组件中执行异步请求，然后再派发`action`更新`reducer`的数据即可，类似下面的操作：

```javascript
// component.js
import { getData } from './actionCreators';
import store from '../store/index.js'
// ......
componentDidMount() {
  fetch('http://192.168.xx/getList').then(res => {
    const { data }  = res
    const action = getData(data)
    store.dispatch(action)
  })
},
// actionCreators.js
export const getData = (value) => ({
  type: 'GET_DATA',
  value
});
```

- 2、或者是在`actionCreators`中操作异步逻辑，然后通过参数的方式传递`dispacth`。

```javascript
// component.js
import store from '../store/index.js'
import { getData } from './store/actionCreatores.js'
......
componentDidMount() {
  store.getData(store.dispatch)
}
// actionCreators.js
export const getData = (dispatch) => {
  return fetch('http://192.168.xx/getList').then(res => {
      const { data }  = res
      const action = {
        type: 'GET_DATA',
        data
      }
      dispatch(action)
    })
};
```

以上两种方式都可以实现更新`store`中的状态`state`。

`既然如此，我为什么还需要使用Redux-thunk？`

### 直到我看到这个👉
英文版：`https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594`

中文你可以看这篇：`http://www.xiaojichao.com/post/why-do-we-need-middleware-for-async-flow-in-redux.html`

### 才明白问题所在.....
- 1、方式一如果在大型应用中，需要在大量的组件中执行相同的操作，之所以使用`redux`就是因为数据共享的问题，如果需要使用数据的每个组件都执行一遍请求操作，一方面不利于调试，也明显违背了使用`redux`的初衷。因此需要讲UI组件和`action creator`进行剥离。
- 2、方式二通过动态传递参数的方式，虽然看起来已经将UI组件和`action creator`进行了分离，但是UI组件首先知道要调用的对象是同步还是异步的，而且还需要根据不同的方式编写不同风格的代码（例如，传递同步参数等）。

### 正确的打开方式应该是这样👉
UI组件并不关心action creator是否是异步的。UI组件就像正常的去调用一个普通的操作，当然也可以使用mapDispatchToProps来简化代码。UI组件也不知道action creator是怎么实现的，因此你可以切换各种异步实现方式（Redux Thunk, Redux Promise, Redux Saga），而且还不需要改组件的代码。

### 来个更加形象一点的说法！
UI组件就好比是我们，而`redux`就好比是银行，通常我们将钱存进银行，需要的时候就去银行取，这就是同步更新数据操作。

但是，当有一天我们需要使用在境外银行存的钱，我们就没必要自己直接去境外银行取，因为可能涉及到比较多的手续会很麻烦。那么我们就可以将专业的事情交给专业的人去做，让银行之间进行划转，我们直接去使用的银行取就可以了。对于我们来说，并没有改变取钱的方式，而中间的工作都交给了银行取操作，也就是这里的`action creator`的异步操作。我们根本不用关心银行使用的是什么方法，对应的就是UI组件不关心，在`action creator`中是使用的是`Redux-thunk`还是` Redux-saga`，它不需要改组件的代码。


说到这里，大家应该都明白了吧！所以`Redux-thunk`和` Redux-saga`就该登场了！！

## Redux-thunk
* 安装
```bash
npm install redux-thunk -S
```
* 使用配置

`注意`:在配置`redux-thunk`的时候如果安装官方文档配置，直接把`thunk`放到`createStore`里的第二个参数，如果配置了`Redux Dev Tools`会发生冲突，如果想要同时使用，就需要引入增强函数`compose`。
```javascript
// store/index.js
// 1引入applyMiddleware和增强函数compose
import { createStore , applyMiddleware, compose } from 'redux' 
import reducer from './reducer' 
// 2引入redux-thunk
import thunk from 'redux-thunk'
// 3使用compose创建增强函数
const composeEnhancers =   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}):compose
// 4传入thunk
const enhancer = composeEnhancers(applyMiddleware(thunk))
// 5把enhancer作为createStore的第二个参数传入
const store = createStore( reducer, enhancer) 
export default store
```

* 开始使用
```javascript
// actionCreatores.js
export const getData = () =>{
  // dispatch 会作为参数自动传递进来
    return (dispatch)=>{
        axios.get('xxx/getData').then((res)=>{
            const data = res.data
            const action = {
              type: 'GET_DATA',
              data
            }
            dispatch(action)
        })
    }
}
// component.js
import store from '../store/index.js'
import { getData } from './store/actionCreatores.js'
....
componentDidMount() {
  const action = getData()
  store.dispatch(action)
}
```

## Redux-saga
`Redux-thunk`中间件可以使我们以一种更加优雅的方式异步更新`store`中的数据，在中小型项目中，非常好用，但是也不得不承认其存在的缺点，`Redux-thunk`将同步异步更新数据的逻辑都放在`creator`中操作，很容易形成面条式的代码，不方便管理。那么，我们可以使用另一种更加适合于大型项目异步更新数据的中间件 - `Redux-saga`。

### 基本使用

* 安装
```bash
npm install redux-saga -S
```
* 在`store`文件夹下创建`saga.js`文件单独管理异步操作.
```bash
touch saga.js
```
* 使用配置
```javascript
// store/index.js
// 1引入applyMiddleware和增强函数compose
import { createStore , applyMiddleware, compose } from 'redux' 
import reducer from './reducer' 
// 2引入创建saga中间件的方法.并创建saga中间件
import createSagaMiddleware from 'redux-saga' 
const sagaMiddleware = createSagaMiddleware();
// 3引入saga.js文件
import mySagas from './saga.js'
// 4使用compose创建增强函数
const composeEnhancers =   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}):compose
// 5传入saga中间件
const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware))
// 6把enhancer作为createStore的第二个参数传入
const store = createStore( reducer, enhancer) 
// 7执行saga.js文件
sagaMiddleware.run(mySagas)

export default store;
```

*  开始使用

1. UI组件派发`action`到`actionCreator`
```javascript
// component.js
import store from '../store/index.js'
import { getData } from '../store/actionCreator.js'
componentDidMount() {
  const action = getData()
  store.dispatch(action)
}
```
2. `actionCreator`转发`action`到`saga`
```javascript
// actionTypes.js
// 获取数据
export const GET_DATA = 'get_data' 
// 更新数据
export const UPDATE_DATA = 'update_data'

// actionCreator.js
import { GET_DATA, UPDATE_DATA } from './actionTypes.js'
// 通知saga执行异步操作的action
export const getData = () => ({
  type: GET_DATA
})
// saga执行异步操作完毕，更新reducer数据的action
export const updateData = () => ({
  type: UPDATE_DATA,
  data
})
```
3. `saga`监听到`action`后，获取异步数据，派发`action`到`reducer`更新数据
```javascript
// saga.js
// 引入takeEvery(监听action),put（派发action）
import { takeEvery ,put } from 'redux-saga/effects' 
import { GET_DATA } from './actionTypes.js'
import { reqData } from '../api/index.js'
import { updateData } from '../store/actionCreator.js'
function* mySaga(){
  // 监听到GET_DATA后执行getDataList方法
  yield takeEvery(GET_DATA, getDataList)
}
function* getDataList(){
  // 执行异步操作
  const res = yield reqData()
  if (res.code === 200) {
    const { data } = res
    // 派发更新数据的action
    const action = updateData(data)
    put(action)
  }
}
export default mySaga
```
4. `reducer`收到`action`后更新数据
```javascript
// reduce.js
import { UPDATE_DATA } from './actionTypes.js'
const defaultState = {
  list: []
}
export default(state = defaultState, action) => {
  if (action.type === UPDATE_DATA) {
    const newState = JSON.parse(JSON.stringify(state))
    newState.list = action.data
    return newState
  }
}
```
### `saga`分模块管理
在实际项目中，可能有很多需要异步派发的`action`，如果所有的`saga`都写在同一个文件中很容易造成混乱，因此根据业务分模块管理就变得十分有必要，`redux-saga`本身也提供了分模块管理的方法。
```javascript
// store/sagas/index.js
// saga相关模块化引入
import { fork, all } from 'redux-saga/effects'
// 异步逻辑模块文件引入
import { loginSagas } from './modules/login.js'
import { userSagas } from './modules/user.js'
import { businessSagas } from './modules/business.js'
// 合并saga，单一进入点，一次启动所有Saga
export default function* rootSaga() {
    yield all([
        fork(loginSagas),
        fork(userSagas),
        fork(businessSagas)
    ])
}

// store/index.js
import { createStore , applyMiddleware, compose } from 'redux' 
import reducer from './reducer' 
import createSagaMiddleware from 'redux-saga' 
const sagaMiddleware = createSagaMiddleware();
// 引入合并后的saga
import rootSaga from './sagas/index'
const composeEnhancers =   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}):compose
const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware))
const store = createStore( reducer, enhancer) 
// 执行saga
sagaMiddleware.run(rootSaga)
export default store;
```

# React-redux

`Redux`作为`React`的状态共享管理工具，其本身也存在使用缺陷，为了更好的使用`Redux`,社区基于`Redux`推出了更加方便易用的第三方库`React-redux`。

## 基本使用

- 1、 创建`store`和`reducer`

```javascript
// store/index.js
import { createStore } from 'redux'
import reducer from './reducer'
const store = createStore(reducer)
export default store
// store/reducer.js
const defaultState = {
  inputValue: ''
}
export default (state = defaultState, action) => {
  return state
}
```

- 2、 使用`Provider`组件连接`store`

被`Provider`组件包裹的组件都可以使用`store`中的数据.

```javascript
// 入口index.js
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import TodoList from './TodoList'
cosnt App = (
  <Provider store = {store}>
    <TodoList />
  </Provider>
)
ReactDOM.render(App,document.getElementById('root'))
```

- 3、 使用`connect`方法将`store`中的数据和映射到组件的`props`
- 4、 使用`connect`方法将`store`的`dispatch`方法映射到组件的`props`

```javascript
// TodoList.js
import React, { Component } from 'react'
import store from '../store'
import connect from 'react-redux'
class TodoList extends Component {
  return (
    // store的state隐射到组件props之后，使用的时候直接是this.props.xxx
    // store的dispacth映射到props后，也可以直接this.props.fn绑定方法
    <input value = {this.props.value}
            onChange={this.props.changeInputValue}/>
  )
}

// 将store中的数据映射到组件，变成组件的props,参数state是store中的state
const mapStateToProps = (state) => {
  return {
    inputValue：state.inputValue
  }
}
// 把store的dispatch映射到组件，变成组件的props，可以直接this.props.xx的方式调用
const mapDisptachToProps = (dispatch) => {
  return {
    changeInputValue(e) {
      const action = {
        type: 'change_input_value',
        value: e.target.value
      }
      dispatch(action)
    }
  }
}
// 把store的state和dispatch和TodoList组件关联
export defalut connect(mapStateToProps,mapDisptachToProps)(TodoList)
```

- 5、 `store`接收到`dispatch`的`action`后，在`reducer`中更新`store`中的数据

```javascript
// store/reducer.js
const defaultState = {
  inputValue: ''
}
export default (state = defaultState, action) => {
  if (action.type === 'change_input_value') {
    const newState = JSON.parse(JSON.stringify( state );
    newState.inputValue = action.inputValue;
    return newState;
  }
  return state
}
```

---

## `Reducer`分模块管理

实际项目开发中，`reducer`中可能要放很多的数据，如果都存放在一个`reducer`中，很容易造成数据很多而难以维护，因此我们可以根据业务模板拆分成多个`reducer`进行分开管理。

- 1、分模块拆分`reducer`

```javascript
// header/reducer.js
const defaultState = {
  a: ''
}
export default (state = defaultState, action) => {
  // ...更新数据，需要带模块名
  return state
}
// footer/reducer.js
const defaultState = {
  b: ''
}
export default (state = defaultState, action) => {
  // ...更新数据，需要带模块名
  return state
}
```

- 2、合并整合`reducer`

```javascript
// store/reducer.js
import { combineReducers } from 'redux'
import reducer as headerReducer  from './header/reducer.js'
import reducer as footerReducer from './footer/reducer.js'
const reducer = combineReducers({
  header: headerReducer,
  footer: footerReducer
})
export default reducer;
```

- 3、组件取值

分模块管理后，取值时需要带上模块名。

```javascript
// TodoList.js
// ...
const mapStateToProps = (state) => {
  return {
    // 需要带上模块名才能正确取值
    a: state.header.a
  }
}
// ...
```

reducer 分模块管理后，主要变更就是以上三点，其他步骤不变。

# Immutable 加持

在`Redux`中，我们修改`store`中的数据的时候，不可以直接修改，而是需要先拷贝一个副本来修改，然后再返回副本。该方式虽然可以实现，但拷贝副本对性能有一定的损耗。此时,`immutable.js`就该登场了。将`reducer`中的普通数据对象转换为`immutable`对象就可以直接修改数据而无需拷贝副本。

## immutable.js

- 1、 将`reducer`中普通数据对象转换为`immutable`对象

```javascript
// reducer.js
import { fromJS } from 'immutable'
// 转换
const defaultState = fromJS({
  a: ''
})
```

- 2、 获取和更新数据

```javascript
// 获取数据
// TodoList.js
// ...
const mapStateToProps = (state) => {
  return {
    // state是根基级reducer的state，header模块已经是immutable对象，因此需要get()方法获取值
    a: state.header.get('a')
  }
}
// ...
// 更新数据
// reducer.js
// ...
export default (state = defaultState,action) => {
  if (action.type === 'xxxx') {
    // 这里的state是header模块的state，已经转换为immutable对象，可以使用set来更新值
    return state.set('a',123)
    /*  同时改变多个值时可以使用merge
    return state.merge({
      a: xxx,
      b: yyy
    })
    */
  }
  return state
}
```

## Redux-immutable

使用`immutable.js`虽然进一步完善了`redux`，但是在获取`store`中的数据的时候，因为是不同类型的对象取值方式不统一。如:`state.header.get()`,`state`是普通对象，通过点的方式取对象属性，`header`是`immutable`对象，通过`get`方法取值。为了进一步统一和完善。`redux-immutable`就诞生了。

- 1、 在合并`reducer`时将根级`reducer`的`state`转换为`immutable`对象

```javascript
// store/reducer.js
import { combineReducers } from 'redux-immutable'
import { reducer as headerReducer } from '../header/store/reducer.js'
const reducer = combineReducers({
  header: headerReducer
})
export default reducer
```

- 2、 取值

```javascript
  // TodoList.js
  // ...
  const mapStateToProps = (state) => {
    return {
      // state和header都被转化为了immutable对象，都可以使用get方法取值
      a: state.get('header').get('a')
      // 或者使用getIn方法
      // a: state.getIn(['header','a'])
    }
  }
  // ...
```

# 完整代码演示

```javascript
|- store
  |- modules
    |- todoList
      |- index.js
        import reducer from './reducer';
        import * as actionCreators from './actionCreators';
        import * as actionTypes from './actionTypes';
        export { reducer, actionCreators, actionTypes };

      |- reducer.js
        import * as actionTyps from "./actionTypes";
        const defaultState = {
          inputValue: ""
        };
        export default ( state = defaultState , action ) => {
          switch(action.type) {
            case actionTyps.CHANGE_INPUT_VALUE:
              return state.set('inputValue',action.inputValue)
            case xx:
              ....
            default:
              return state;
          }
        }

      |- actionTypes.js
        export const CHANGE_INPUT_VALUE = 'todoList/CHANGE_INPUT_VALUE';

      |- actionCreators.js
        import * as actionTyps from './actionTyps';
        export const changeInputValue = (value) => ({
          type: actionTyps.CHANGE_INPUT_VALUE,
          value
        });

  |- index.js
    import { createStore } from 'redux'
    import reducer from './reducer'
    const store = createStore(reducer)
    export default store

  |- reducer.js
    import { combineReducers } from 'redux-immutable';
    import { reducer as todoListReducer }  from './modules/todoList'
    const reducer = combineReducers({
      todoList: todoListReducer
    })
    export default reducer;

|- index.js // 入口js
  import React from 'react'
  import ReactDOM from 'react-dom'
  import { Provider } from 'react-redux'
  import store from './store'
  import TodoList from './TodoList'
  cosnt App = (
    <Provider store = {store}>
      <TodoList />
    </Provider>
  )
  ReactDOM.render(App,document.getElementById('root'))

|- TodoList.js // 组件
  import React, { Component } from 'react';
  import { connect } from 'react-redux';
  import { actionCreators } from '../store/todoList';
  class TodoList extends Component {
    render() {
      return (
        <input value= {this.props.inputValue}
               onChange = {this.props.changeInputValue} />
      )
    }
  }
  const mapStateToProp = (state) => {
    return {
      inputValue: state.getIn(['todoList','inputValue'])
    }
  }
  const mapDispathToProps = (dispatch) => ({
    changeInputValue(value) {
      dispatch(actionCreators.changeInputValue(value))
    }
  })
  export default connect(mapStateToProps, mapDispathToProps)(TodoList);
```
至此，使用`Redux`作为`React`的状态管理工具的分享就结束了，本文可谓是手把手的`Redux`及周边生态教学，希望看到的你能有所裨益！
