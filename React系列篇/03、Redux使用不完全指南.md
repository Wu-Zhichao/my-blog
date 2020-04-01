Redux是React框架下的一款状态管理工具，可以实现多个组件之间的数据共享和传递。学习和掌握Redux以及周边生态可以使我们更好的进行React项目开发。下面我们就详细的讲述Redux在实际项目开发中的使用。

# Redux基本使用
- 简单使用

1. 创建`store`及`reducer`
   
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
    
2. 在组件中获取`store`中的数据

   ```javascript
    // todoList.js
    this.state = store.getState()
   ```
    
 3. 请求修改`store`中的数据

    ```javascript
    // todoList.js
    const action = { 
      type : "CHANGE_INPUT_VALUE",
      a: 123;
    }
    store.dispatch( action )
    ```

4. `store`收到修改请求后在`reducer`中执行修改

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

5. 在组件中监听到`store`数据发生变化后触发回调方法重新获取`store`数据来更新组件数据。

   ```javascript
    // todoList.js
    // 监听store中数据发生变化
    store.subscribe( this.handleStoreChange)
      // 执行回调更新组件数据
    handleStoreChange() {
      this.setState(store.getState());
    }
   ```

- 项目使用示例

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

# Redux的中间件
为了近一步丰富`Redux`生态，围绕着`Redux`周边有很多第三方中间件。其中为了使`Redux`更好的提供异步操作的支持，有两个比较常用的中间件`Redux-thunk`和`Redux-saga`。

- Redux-thunk
- Redux-saga


# React-redux
`Redux`作为`React`的状态共享管理工具，其本身也存在使用缺陷，为了更好的使用`Redux`,社区基于`Redux`推出了更加方便易用的第三方库`React-redux`。
 ### 基本使用
1. 创建`store`和`reducer`
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
2. 使用`Provider`组件连接`store`
   被`Provider`组件包裹的组件都可以使用`store`中的数据.
    ```javascript
    // 入口index.js
    import React from 'react
    import ReactDOM from 'react-dom
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
3. 使用`connect`方法将`store`中的数据和映射到组件的`props`
4. 使用`connect`方法将`store`的`dispatch`方法映射到组件的`props`
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

5. `store`接收到`dispatch`的`action`后，在`reducer`中更新`store`中的数据
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
-----

### `Reducer`分模块管理
实际项目开发中，`reducer`中可能要放很多的数据，如果都存放在一个`reducer`中，很容易造成数据很多而难以维护，因此我们可以根据业务模板拆分成多个`reducer`进行分开管理。

- 分模块拆分`reducer`
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
- 合并整合`reducer`
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
- 组件取值
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
  > reducer分模块管理后，主要变更就是以上三点，其他步骤不变。

# Immutable加持
在`Redux`中，我们修改`store`中的数据的时候，不可以直接修改，而是需要先拷贝一个副本来修改，然后再返回副本。该方式虽然可以实现，但拷贝副本对性能有一定的损耗。此时,`immutable.js`就该登场了。将`reducer`中的普通数据对象转换为`immutable`对象就可以直接修改数据而无法拷贝副本。

- 基本使用
1. 将`reducer`中普通数据对象转换为`immutable`对象
    ```javascript
    // reducer.js
    import { fromJS } from 'immutable'
    // 转换
    const defaultState = fromJS({
      a: ''
    })
    ```
2. 获取和更新数据
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
- Redux-immutable
使用`immutable.js`虽然进一步完善了`redux`，但是在获取`store`中的数据的时候，因为是不同类型的对象取值方式不统一。如:`state.header.get()`,`state`是普通对象，通过点的方式取对象属性，`header`是`immutable`对象，通过`get`方法取值。为了进一步统一和完善。`redux-immutable`就诞生了。

- 基本使用
  1. 在合并`reducer`时将根级`reducer`的`state`转换为`immutable`对象
  ```javascript
  // store/reducer.js
  import { combineReducers } from 'redux-immutable'
  import { reducer as headerReducer } from '../header/store/reducer.js'
  const reducer = combineReducers({
    header: headerReducer
  })
  export default reducer
  ```
  2. 取值
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
  import React from 'react
  import ReactDOM from 'react-dom
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
      dispatch(actionCreators(value))
    }
  })
  export default connect(mapStateToProps, mapDispathToProps)(TodoList);
```
