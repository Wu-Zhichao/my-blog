# 1. React Hooks是什么
React Hooks是React V16.8版本新增的特性，即在不编写类组件的情况下使用state以及React的新特性。React官网提供了10个Hooks API,来满足我们在函数组件中定义状态，提供类似生命周期的功能和一些高级特性。
# 2. Hooks的诞生背景
## 2.1. 类组件的不足
- 状态逻辑难以复用：
   在旧版本的React中，想要实现逻辑的复用，需要使用到`HOC`或者`Render Props`，增加了组件的使用层级，同时学习使用成本也比较高。
- 使用趋于复杂且维护成本较高
  有多个监听状态的生命周期，同一个功能的整个过程可能要在不同的生命周期完成，不够统一；尤其是引入Redux后，会变得复杂，维护成本较高。
- this绑定问题
  在类组件中如果不使用箭头函数，需要显示的绑定this，容易造成this丢失，导致数据混乱。

## 2.2. Hooks的优势
- 自定义Hooks可以实现公共的逻辑抽离，便于复用
- 可以将组件抽成更小的函数单元，实现一个函数只关注一个功能，更加清晰
- 更加丰富的性能优化手段
- 组件树层级变浅，使用HOC/Render Props实现组件的状态复用，会增加组件的层级，但Hooks无需增加层级即可实现。

# 3. 10个官方Hooks案例详解
## 3.1. useState
定义组件状态，在组件中需要被保存的数据（不用组件每次更新都重新初始化），都可以通过`useState`来定义。
```js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button,Modal } from 'antd'
/**
 * useState：定义组件的状态
 * 作用：
 * 通过传入 `useState` 参数后返回一个带有默认状态和改变状态函数的数组。通过传入新状态给函数来改变原本的状态值。
 */

// 类组件写法
class Example extends React.Component {
  constructor() {
    super()
    this.state = { count: 0}
  }
  render() {
    return (
      <div>
        <div>你点击了{this.state.count}次</div>
        <button onClick={() => this.setState({count: this.state.count +1})}>点击</button>
      </div>
    )
  }
}
// hooks 写法
function Example1() {
  // 定义一个count变量，赋初始值0
  const [count,setCount] = useState(0)
  return (
    <div>
      <div>你点击了{count}次</div>
      <button onClick={() => setCount(count +1 )}>点击</button>
    </div>
  )
}
// setCount 接收函数作为参数
function Example2() {
  const [count,setCount] = useState(0)
  // preCount 参数为上一次的值
  const countAction = (preCount,a) =>  preCount + a
  return (
    <div>
      <div>你点击了{count}次</div>
      <button onClick={() => setCount(countAction(count,1))}>点击</button>
    </div>
  )
}
/**
 * 2 . renderProps 和 hooks 的比较。彻底理解 hooks 的价值和优点。
 */
// renderProps 抽离公共逻辑
class Toggle extends React.Component {
  // 定义默认属性
  state= { on: false}
  constructor(props) {
    super(props)
    // 接收父组件传递的参数
    this.state.on = this.props.initial
  }
  toggle = () => {
    this.setState({ on: !this.state.on })
  }
  render() {
    // 向子组件传递了属性和方法
    return this.props.children(this.state.on,this.toggle)
  }
}
function Example3() {
  return (
    <Toggle initial={false}>
      {/* 通过一个方法接收参数 */}
      {
        (on,toggle) => (
          <React.Fragment>
            <Button type="primary" onClick={toggle}>打开弹框</Button>
            <Modal visible={on} onOk={toggle} onCancel={toggle}>我是弹框</Modal>
          </React.Fragment>
        )
      }
    </Toggle>
  )
}

// hooks 写法 - 优势：多个状态不会产生嵌套
function Example4 () {
  const [visible,setVisible] = useState(false)
  return (
    <div>
      <Button type='primary' onClick={() => setVisible(true)}>打开弹框</Button>
      <Modal visible={visible} onOk={() => setVisible(false)} onCancel={() => setVisible(false)}>我是弹框内容</Modal>
    </div>
  )
}

const App = props => <div>
  <Example />
  <hr />
  <Example1 />
  <hr/>
  <Example2/>
  <hr />
  <Example3 />
  <hr />
  <Example4 />
</div>

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```
- 注意
如果想要在`useState`参数中保存函数，那么函数参数会在组件初始化时执行，后续渲染时会被忽略，如果初始`state`需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 `state`.
```js
const [state, setState] = useState(() => {
  // 只会在组件初始化时执行一次
  const initialState = someExpensiveComputation(props);
  return initialState;
});
```
那么，如果想要用`useState`保存函数，有什么办法呢？
1. 方式一：在函数外面在包一层函数
```js
import React, { useState } from "react";
export default function App() {
  const [callback, setCallback] = useState(() => () => {
    console.log("hello");
  });
  console.log(callback);
  return (
    <div className="App">
      <button onClick={() => setCallback(() => () => console.log("world"))}>
        setCallback
      </button>
      {/* 第一次调用点击打印hello，执行setCallback后打印world */}
      <button onClick={callback}>callback</button>
    </div>
  );
}
```
2. 使用useRef
```js
import React, { useRef } from "react";
export default function App() {
  // useRef可以一直保留状态初始化时的引用，组件更新时还是保留之前的引用
  const callbackRef = useRef(() => console.log("hello"));
  const callback = callbackRef.current;
  console.log(callback);
  return (
    <div className="App">
      <button
        onClick={() => (callbackRef.current = () => console.log("world"))}
      >
        setCallback
      </button>
      {/* callback 是首次渲染时保留的callbackRef的函数引用，所以会一直打印hellow */}
      <button onClick={callback}>callback</button>
      {/* 首次打印hello，执行setCallback后，已经更新为新的函数引用了，所以打印world */}
      <button onClick={() => callbackRef.current()}>
        callbackRef callback
      </button>
    </div>
  );
}

```


## 3.2. useEffect
```js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button,Modal } from 'antd'
/**
 * useEffect: 处理副作用（副作用：指那些没有发生在数据向视图转换过程中的逻辑，如 ajax 请求、访问原生dom 元素、本地持久化缓存、绑定/解绑事件、添加订阅、设置定时器、记录日志等。）
 * 作用：  函数组件能保存状态，但是对于异步请求，副作用的操作还是无能为力，所以 React 提供了 useEffect 来帮助开发者处理函数组件的副作用，类似生命周期函数，相当于是 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合，可以通过传参及其他逻辑，分别模拟*这三个生命周期函数。
 * useEffect具有以下5个特性：
 * 1. 第一次渲染时执行，任何状态发生变化都执行 - 只指定一个回调函数作为参数， 相当于componentDidMount & componentDidUpdate
 * 2. 第一次渲染执行，任何状态发生变化时不执行
 * 3. 第一次渲染执行，通过第二个参数指定状态发生变化时执行，其他状态发生变化不执行
 * 4. 监听多个状态时，可以同时定义多个useEffect
 * 5. 组件卸载时会执行回调函数返回的回调函数 - 相当于componentWillUnmount
 * 6. 未传递第二个参数，所有状态更新就执行useEffect，或者指定状态，对应状态更新执行useEffect时，会先执行返回值回调，再执行第一个回调参数（第二个参数为空数组时任何状态更新都不会执行）
 * 

/**
 * 1. useEffect只有一个回调函数作为第一个参数时：
 *   1.1.初始化时会执行一次回调函数
 *   1.2.任一一个状态数据发生变化时都会执行回调函数
 */
function Example () {
  const [count,setCount] = useState(0)
  useEffect(() => {
    // 初始化时执行一次，count每次变化的时候都会执行
    console.log('我执行啦！')
  })
  return (
    <div>
       <div>点击了{count}次</div>
      <Button type='primary' onClick={() => setCount(count+1)}>点击</Button>
    </div>
  )
}

/**
 * 2. useEffect传入两个参数：第一个参数是回调函数，第二个参数是空数组：
 *    useEffect的回调函数只会在初始化渲染时执行一次
 */
function Example1() {
  const [count,setCount] = useState(0)
  useEffect(() => {
    // 只会在初次渲染时执行，任何状态数据发生变化都不会执行
    console.log('我执行啦111111！')
  },[])
  return (
    <div>
      <div>你点击了{count}次</div>
      <Button type='primary' onClick={() => setCount(count + 1)}>点击</Button>
    </div>
  )
}

/**
 * 3. useEffect 传入两个参数，第一个是回调函数，第二个是指定数据的数组
 *   3.1 初次渲染时执行一次回调函数
 *   3.2 指定数据发生变化时执行一次回调函数
 */
function Example2() {
  const [visible,setVisible] = useState(false)
  const [count,setCount] = useState(0)
  useEffect(() => {
    // 初始渲染时会执行一次，visible状态发生变化时会执行，count发生变化时则不会执行
    console.log('我最帅了')
  },[visible])
  return (
    <div>
      <div>点击了{count}次</div>
      <Button type='primary' onClick={() => setCount(count +1) }>点击</Button>
      <Button type='primary' onClick={() => setVisible(true)}>打开弹框</Button>
      <Modal visible={visible} onOk={() => setVisible(false)} onCancel={() => setVisible(false)}>我是弹框内容</Modal>
    </div>
  )
}

/**
 * 4. 监听多个状态发生变化时执行useEffect的回调函数时，可以同时使用多个useEffect
 */
 function Example3() {
  const [visible,setVisible] = useState(false)
  const [count,setCount] = useState(0)
  useEffect(() => {
    // 初始渲染的时候执行一次，count状态发生变化时会执行
    console.log('我是count')
  },[count])
  useEffect(() => {
    // 初始渲染时会执行一次，visible状态发生变化时会执行，count发生变化时则不会执行
    console.log('我是弹框')
  },[visible])
  return (
    <div>
      <div>点击了{count}次</div>
      <Button type='primary' onClick={() => setCount(count +1) }>点击</Button>
      <Button type='primary' onClick={() => setVisible(true)}>打开弹框</Button>
      <Modal visible={visible} onOk={() => setVisible(false)} onCancel={() => setVisible(false)}>我是弹框内容</Modal>
    </div>
  )
}
/**
 * 5. useEffect的回调函数的返回值（回调函数）执行时机：
 *  ① 组件销毁时
 *  ② 未传递第二个参数，所有状态更新就执行useEffect，或者指定状态，对应状态更新时，会先执行返回值回调，再执行第一个回调参数
 * ps： 如果指定第二个参数为空数组时状态更新还是不会执行的
 */
function Test() {
  const [ count, setCount ] = useState(0)
  useEffect(() => {
    console.log('Test组件渲染更新了')
    return () => {
      // 组件卸载时执行
      // 状态更新执行第一个参数回调前会先执行
      console.log('Test组件销毁了')
    }
  },[count])
  return (
    <div>
      <Button type='primary' onClick={() => setCount(count + 1)}>点击</Button>
      <div>测试子组件点击了{count}次数</div>
    </div>
  )
}
function Example4 () {
  const [show,setShow] = useState(true)
  return (
    <div>
      <Button type='primary' onClick={() => setShow(!show)}>显示/关闭</Button>
      {
        show ? <Test /> : null
      }
    </div>
  )
}
const App = props => {
  return (
    <div>
      <Example />
      <hr />
      <Example1 />
      <hr />
      <Example2 />
      <hr />
      <Example3 />
      <hr />
      <Example4 />
    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```
- 注意：
*非状态的非基本类型的数据，不要作为依赖，因为引用类型的数据保留的是一个引用，组件重新渲染初始化时会创建新的引用，导致依赖发生变化，useEffect会重复执行，造成死循环。*

## 3.3. useContext
```js
import React, { useContext, useState }  from "react";
import ReactDOM from 'react-dom';
/**
 * useContext:  减少组件层级
 * 是类组件的的context的的hooks版，主要用于在父组件中公共数据和逻辑的抽离，方便子组件公用。
 */
// 1. 创建Context对象
const ThemeContext = React.createContext()
// 2. Provider 组件，发布数据，向所有的子组件提供数据
const App = props => {
  const [theme,setTheme] = useState('green')
  return (
    // Provider 发送数据，两个属性，用对象的形式
    <ThemeContext.Provider value={{theme,setTheme}}>
      <div>
        <Toolbar />
      </div>
    </ThemeContext.Provider>
  )
}
// 中间组件
const Toolbar = props => {
  return (
      <div>
          <ThemedButton />
      </div>
  )
}
// 3. 子孙组件使用useContext 接收收据
const ThemedButton = (props) => {
  // useContext接收顶层组件传递过来的context数据， 传递过来是对象，就用对象结构接收
  const { theme,setTheme }= useContext(ThemeContext)
  return (
    <div>
      {/* 可以直接使用接收到的数据和方法 */}
      <div style={{ 'color': theme }}>Theme: {theme}</div>
      <button onClick={() => setTheme('red')}>切换主题</button>
    </div>
  )
}
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```
## 3.4. useReducer
```js
import React, { useReducer } from 'react';
import ReactDOM from 'react-dom';
/**
 * useReducer: 就是子当以useState执行了比较复杂的state更新
 * 以hook的方式定了新的全局状态管理，可以用来替代redux（实际为同一个作者）
 */
// 接收派发的action，执行对state进行更改
function reducer(state,action) {
  // 传入旧的state，返回新的state
  switch (action.type) {
    case 'reset':
      return { count: action.payload }
    case 'increment':
      return { count: state.count + 1}
    case 'decrement':
      return { count: state.count - 1}
    default: 
      return state
  }
}
// 允许对初始state执行二次变更
function init(initialCountState) {
  return { count : initialCountState.count + 1}
}
function Counter({initialCount}) {
  // state, dispatch 是useReducer返回的内容
  const [state, dispatch] = useReducer(
    reducer,// 派发action 执行state修改
    initialCount, // 传递给state的初始值
    init // 可选参数，允许对初始state进行二次变更
  )
  return (
    <React.Fragment>
      <div>Count: {state.count}</div>
      {/* 执行dispatch派发变更state的action */}
      <button onClick={() => dispatch({ type: 'reset', payload: initialCount.count })}>重置</button>
      <button onClick={() => dispatch({type: 'increment'})}>增加</button>
      <button onClick={() => dispatch({type: 'decrement'})}>减少</button>
    </React.Fragment>
  )
}
const App = props => {
  const initialCountState = {count: 0}
  return (
    <div>
      <Counter initialCount={initialCountState}/>
    </div>
  )
}
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```
## 3.5. useCallback
```js
 import React, { useCallback, useState,memo }  from "react";
 import  ReactDOM  from "react-dom";
 import { Modal } from 'antd' 
 /**
  * useCallback:  记忆函数
  * 作用：性能优化，避免重复的创建引用和重复无意义的组件渲染，加大性能开销，对于一些开销昂贵的组件来说是很好的优化手段。
  * 特性：
  * 1. useCallback 会将第一个函数参数作为回调函数返回，使用useCallback优化过的回调函数，会在组件初始化渲染时创建函数对象并生成引用，之后组件再次更新渲染时则不会再次创建新对象和引用（普通函数每次组件更新都会创新新的函数对象并生成引用）
  * 2. useCallback可以通过传递第二个参数，控制对应的状态数据发生变化时才重新创建对象并生成新的引用，默认值时空数组[]，即不监控状态数据
  */
/**
 * 案例：
 */
 // 1. 未使用useCallback的组件函数，每次数据更新时都会重复创建函数对象生成新的引用
 let fn = null
const Example1 = ({count,setCount}) => {
  // 组件内普通函数
  const ordinaryCallback = () => {
    console.log('我是函数函数')
  }
  // 状态发生变化，组件渲染，一直都返回false => 表明每次渲染都会创建新的函数对象，产生新的引用
  console.log('是否是Example1的同一个回调函数：',Object.is(fn,ordinaryCallback)) // false
  fn = ordinaryCallback
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <div>Count:{count}</div>
    </div>
    
  )
}
// 2. 使用useCallback优化的组件函数，组件重新渲染时不会重新创建函数对象
let fn1 = null
const Example2 = ({count,setCount}) => {
  // 使用useCallback 优化后的组件函数，组件重复渲染时不会重复创新函数对象
  const memoizedCallback = useCallback(() => {
    console.log('我是组件函数')
  },[])
  // 状态更新时，组件重新渲染，初次渲染返回false，更新渲染一直返回true => 表示经过useCallback优化后的函数，在组件更新渲染时不会重复创建函数对象，依旧保持第一次创建时的引用
  console.log('是否是Example2的同一个回调函数：', Object.is(fn1,memoizedCallback)) // 初始渲染是false，之后一直是true
  fn1 = memoizedCallback
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <div>Count: {count}</div>
    </div>
  )
}

// 3. 通过useCallback的第二个参数控制指定状态数据更新，组件重新渲染时，再创建新的函数对象 （感觉没啥卵用）
let fn3 = null
function Example3({count,setCount}) {
  const [visible, setVisible] = useState(false)
  // 设定只有visible发生变化组件更新时才创新创建函数对象，其他情况下渲染不会重新创建
  const memoizedCallback = useCallback(() => {
    console.log('我是组件函数')
  },[visible])
 // count状态发生变化时返回true => 表示不会重新创建函数
 // visible状态发生变化时返回false => 表示会重新创建函数
  console.log('是否是Example3的同一个回调函数：', Object.is(fn3,memoizedCallback))
  fn3 = memoizedCallback
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>增加数量</button>
      <div>Count: {count}</div>
      <button onClick={() => setVisible(!visible)}>显示/隐藏弹框</button>
      <Modal visible={visible} onOk={() => setVisible(!visible)} onCancel={() => setVisible(!visible)}/>
    </div>
  )
}
// 4. 综合案例
// 昂贵开销的组件
const ExpensiveComponent = memo(({fn}) => {
  // 初始化时执行，p1状态更新时会执行，p2状态更新时则不会
  console.log('我被迫渲染啦！！！')
  return <div onClick={fn}>我是一个渲染消耗昂贵的组件</div>
})
let fnn1 = null
const Child1 = () => {
  const fn1 = () => console.log('fn1')
  console.log('fnn1: ', Object.is(fnn1,fn1))
  fnn1 = fn1
  return <div>
    <ExpensiveComponent fn={fn1}/>
  </div>
}
let fnn2 = null
const Child2 = () => {
  // 使用useCallback 不会重复创建函数对象，fn2不会重复创建增加ExpensiveComponent组件的重复渲染
  const fn2 = useCallback(() => console.log('fn2'),[])
  console.log('fnn2: ', Object.is(fnn2,fn2))
  fnn2 = fn2
  return <div>
    {/* p2状态改变不会导致fn2引用变化，因此该组件不会重复渲染 */}
    <ExpensiveComponent fn={fn2}/>
  </div>
}
const Example4 = () => {
  const [p1, setP1] = useState(0)
  const [p2, setP2] = useState(0)
  return (
    <div>
      <h4>每次点击fn4都是新的</h4>
      <Child1 p1={p1}/>
      <button onClick={() => setP1(p1 + 1)}>按钮1</button>
      <hr />
      <h4>每次点击fn4不重新生成</h4>
      <Child2 p2={p2}/>
      <button onClick={() => setP2(p2 + 1)}>按钮2</button>
    </div>
  )
}

const App = props => {
  const [count,setCount] = useState(0)
  return (
    <div>
      <Example1 count={count} setCount={setCount}/>
      <hr />
      <Example2 count={count} setCount={setCount}/>
      <hr />
      <Example3 count={count} setCount={setCount}/>
      <hr />
      <Example4 />
    </div>
  )
}
 ReactDOM.render(<App/>,document.getElementById('root'))
```
## 3.6. useMemo
```js

import React, { useMemo, useState } from "react";
import ReactDOM from 'react-dom'
/**
 * useMemo  记忆组件
 * 作用：可以保存组件的渲染结果，根据条件确实是否重新渲染,主要是用来进行性能优化
 * 特性：
 * 1. 使用useMemo包括的jsx代码段初次渲染后，会将渲染结果保存，组件再次更新时不会重复渲染
 * 2. 指定状态条件发生变化时，才会进行重新渲染
 * 场景：
 * 在一些复杂计算的代码段中，可能并不依赖很多组件状态，如果任一状态发生变化时都重新渲染，是很大的性能开销，此时就可以使用useMemo，将这样的代码段包裹起来，
 * 只有依赖的状态发生变化时才会重新渲染，可以进行组件的性能提升。
 */
const Child = ({c}) => {
  console.log('Child重新渲染',c)
  return (
    <div>{c}</div>
  )
}

const Parent = ({a,b}) => {
  // a,b发生改变时都会重新渲染
  const child1 = <div>
    { console.log('这是一个复杂的计算child1')}
    <Child c={a}/>
  </div>
  // 初次渲染，之后只有b发生改变时才会重新渲染，否则保留上一次渲染的结果
  const child2 = useMemo(() => 
    <div>
      { console.log('这是一个复杂的计算child2')}
      <Child c={b}/>
    </div>,
    [b]
  )
  return (
    <React.Fragment>
      { child1 }
      { child2 }
    </React.Fragment>
  )
}

const App = () => {
  const [a,setA] = useState(0)
  const [b,setB] = useState(0)
  return (
    <div>
      <Parent a={a} b={b}/>
      <button onClick={() => setA(a + 1)}>改变a</button>
      <button onClick={() => setB(b + 1)}>改变b</button>
    </div>
  )
}
ReactDOM.render(<App/>,document.getElementById('root'))
```
## 3.7. useRef
```js
import React, { useEffect, useRef, useState } from "react";
import  ReactDOM  from "react-dom";
/**
 * useRef: 保存引用值
 * 两个作用：
 * 1. 相当于类组件的一个实例属性，只要组件实例不销毁，就一直保持着引用，组件更新时也不会重新初始化,返回一个包含current属性的对象
 * 2. 获取dom元素的一个引用
 * 
 */
const Counter1 = () => {
  const [count,setCount] = useState(0)
  // 初始化后会一直保持着引用，状态变化组件更新重新渲染时也不会被重新初始化，返回一个具有current属性的对象
  const countRef = useRef(0)
  console.log('countRef',countRef)
  useEffect(() => {
    // 组件初始化和状态更新时执行
    countRef.current = count
    console.log('组件渲染完成')
  }) 
  const prevCount = countRef.current
  return (
    <div>
      NowCount: {count}, beforeCount: {prevCount}
      { console.log('组件渲染中')}
      <button onClick={() => setCount(count + 1)}>更新count</button>
    </div>
  )
}
// 使用类组件实现相似功能： 使用useRef定义的变量，相当于类组件的实例属性
class Counter2 extends React.Component {
  state = { count: 0}
  prevCount = 0 //实例属性 相当于useRef定义的变量，不会在更新渲染时重新初始化
  // 初始化渲染完成后执行
  componentDidMount() {
    console.log('组件初始化渲染完毕Counter2')
  }
  // 数据状态更新时执行
  componentDidUpdate() {
    console.log('组件更新渲染完毕Counter2')
    this.prevCount = this.state.count
  }
  render() {
    return (
      <div>
      NowCount: {this.state.count}, beforeCount: {this.prevCount}
      { console.log('组件更新渲染中Counter2')}
      <button onClick={() => this.setState({ count:this.state.count+1})}>更新count</button>
    </div>
    )
  }
}
// 自定义属性模拟类似功能
const countRef = { current: 0} // 唯一区别是因为使用的全局变量，Counter3卸载时，该变量引用还在，数据一直不会变，而使用useRef，组件卸载时引用会丢失
const Counter3 = () => {
  const [count,setCount] = useState(0)
  useEffect(() => {
    console.log('组件初始化渲染/更新渲染完成Counter3')
    countRef.current = count
  })
  const prevCount = countRef.current
  return (
    <div>
    NowCount: {count}, beforeCount: { prevCount }
    { console.log('组件渲染中Counter3')}
    <button onClick={() => setCount(count + 1)}>更新count</button>
  </div>
  )
}
// useRef第二个作用演示：获取一个DOM元素的引用
const TextInputWithFocusButton = () => {
  // 配合ref属性使用可以获取input元素的引用，类似react中的基础api：React.createRef(); 唯一区别是，createRef在每次组件更新时都重新创建一个新的变量，useRef则一直会保持初始化时创建的对象的引用
  const inputElement = useRef()
  const onButtonOnFocus = () => {
    console.log('inputElement',inputElement)
    inputElement.current.focus()
  }
  return (
    <React.Fragment>
      <input ref={inputElement} type='text'/>
      <button onClick={onButtonOnFocus}>Focus this input </button> 
    </React.Fragment>
  )
}
const App = () => {
  const [show,setShow] = useState(true)
  return (
    <div>
      <h3>useRef第一个作用演示案例：</h3>
      <div>
        { show ? <Counter1 /> : null}
        <hr />
        { show ? <Counter2 /> : null}
        <hr />
        { show ? <Counter3 /> : null}
        <button onClick={() => setShow(!show)}>重新挂载</button>
      </div>
      <hr />
      <h3>useRef第二个作用演示案例：</h3>
      <div>
        <TextInputWithFocusButton />
      </div>
    </div>
  )
}

ReactDOM.render(<App/>,document.getElementById('root'))
```
## 3.8. useImperativehandle
- 先理解forwardRef
```js
import React, { createRef, forwardRef, useCallback } from "react";
import ReactDOM from "react-dom";
/**
 * forwardRef:
 * 是React的一个高级特性，理解useRef之前需要先理解forwardRef
 * 作用：forwardRef是一个高阶组件，可以转发收到的ref给其子组件，使其外部可以获取对一个组件内部子组件的引用
 */
// forwardRef是一个高阶组件，它能将收到的ref转发给它的子组件
const FancyButton = forwardRef((props,ref) => (
  <div>
    <input ref={ref}/>
    <button>
      { props.children }
    </button>
  </div>
))
const App = () => {
  // 创建一个ref引用
  const ref = createRef()
  /**
   * ref本身是绑定到FancyButton上的引用，ref.current正常获取到的应该是FancyButton，但是在FancyButton内部通过forwardRef就将引用转发给了input，此时就将ref转发到了input上，所以ref.current获取到的就是input元素，因此才可以调用input元素的focus方法。
   */
  const handleClick = useCallback(() => ref.current.focus(),[])
  return (
    <div>
      {/* 将ref绑定引用到FancyButton上 */}
      <FancyButton ref={ref}>点击</FancyButton>
      <button onClick={handleClick}>获得焦点</button>
    </div>
  )
}
ReactDOM.render(<App/>,document.getElementById('root'))
```
- 搭配 forwardRef和useImperativeHandle一起使用
```js
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import  ReactDOM from "react-dom";
/**
 * useImperativeHandle(): 透传 Ref
 * 作用：使父组件具备了获取子组件【实例】和【状态数据】的能力，还可以根据参数来定义传递的数据是否要随着子组件对应数据的更新而更新
 *      即：子组件通过useImperativeHandle自定义要传递给父组件的状态或功能（想传什么给父组件，就通过useImperativeHandle第二个参数返回值对象中定义即可）
 * 注意：需要配合forwardRef一起使用，需要用到forwardRef转发ref给子组件的能力，否则无法获取到对应的ref引用，数据就不知道传给谁了。
 */
/**
 * 使用forwardRef，转发FancyButton的ref引用到组件内部
 */
const FancyButton = forwardRef((props,ref) => {
  const inputRef = useRef()
  const [inputValue,setInputValue] = useState(0)
  // 在useImperativeHandle中自定义要返回的属性给ref引用
  useImperativeHandle(ref, () => ({
    // 传递功能
    focus: () => {
      inputRef.current.focus()
    },
    // 传递状态数据
    inputValue,
    // 传递实例属性
    inputRef
  }))
  return <input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
})
const App = () => {
  // 创建一个ref引用
  const ref = useRef()
  // 获取input的焦点
  const handleInputFocus = useCallback(() => {
    ref.current.focus()
  },[])
  // 获取传递的状态数据
  const handleGetChildState = useCallback(() => {
    // 因此ref被转发到了FancyButton内部，经过useImperativeHandle就可以获取到返回的相关属性
    console.log('ref',ref.current)
    // {inputValue: '11111', inputRef: {…}, focus: ƒ}
  },[])
  return (
    <div>
      {/* 绑定ref引用到 FancyButton上 */}
      <FancyButton ref={ref}/>
      <button onClick={handleInputFocus}>获取子组件input的焦点</button>
      <button onClick={handleGetChildState}>获取子组件的状态</button>
    </div>
  )
}
ReactDOM.render(<App />,document.getElementById('root'))
```
## 3.9. useLayoutEffect
```js
import React, {useState,useLayoutEffect,useEffect} from "react";
import ReactDOM from "react-dom";
/**
 * useLayOutEffect(): 同步执行副作用
 * 作用：
 *    大部分情况下，使用 useEffect 就可以帮我们处理组件的副作用，但是如果想要同步调用一些副作用，比如对 DOM 的操作，就需要使用 useLayoutEffect，useLayoutEffect 中的副作用会在 DOM 更新之后同步执行。与useEffect类似，只是执行时间不一样,与类组件的componentDidMount 和 componentDidUpdate生命周期执行时机一致
 * 区别：
 *  1. useLayoutEffect总是比useEffect先执行
 *  2. useEffect在全部渲染完毕后才会执行（先渲染，后改变DOM），当改变屏幕内容时可能会产生闪烁
 *  3. useLayoutEffect是会在浏览器 layout之后，painting 之前执行（会推迟页面显示的事件，先改变DOM后渲染），不会产生闪烁
 * 注意：
 *   为了用户体验，优先使用useEffect。以避免阻塞视图更新，但如果涉及到同步调用一些副作用，比如操作dom，可以放在useLayoutEffect中
 */
 function App() {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    // 会在render，dom更新之后就执行，不会等到渲染完
    const title = document.querySelector("#title");
    const titleWidth = title.getBoundingClientRect().width;
    console.log("useLayoutEffect"); // 先打印
    if (width !== titleWidth) {
      setWidth(titleWidth);
    }
  });
  useEffect(() => {
    //dom渲染完毕后执行
    console.log("useEffect");
  });
  return (
    <div>
      <h1 id="title">hello</h1>
      <h2>{width}</h2>
    </div>
  );
}
ReactDOM.render(<App />, document.getElementById('root'))
```
## 3.10. useDebugValue
```js
import React, { useDebugValue, useState,useEffect } from "react";
import ReactDOM from "react-dom";
/**
 * useDebugValue():
 * 作用： 在自定义hooks中使用向开发者工具输出一个调试值，方便我们调试
 */

 function useFriendStatus() {
   const [isOnline, setIsOnline] = useState(true);
   useEffect(() => {
     const interval = setInterval(() => {
       setIsOnline(isOnline => !isOnline);
     }, 1000);
     return () => clearInterval(interval);
   }, []);
   // 在React Developer Tools中hooks一栏显示：
   // e.g. "FriendStatus: Online"
   useDebugValue(isOnline ? "Online" : "Offline");
   return isOnline;
 }
function App() {
   const isOnline = useFriendStatus();
   useDebugValue(isOnline ? "Online" : "Offline");
   return <div className="App">用户: {isOnline ? '在线' : '离线'}</div>;
 }
ReactDOM.render(<App/>,document.getElementById('root') )
```
# 4. 自定义Hooks
- React Hooks中允许我们通过自定义Hooks实现公共逻辑的抽离，在不同组件之间复用。
- 自定义Hooks中可以使用官方提供的Hooks特性定义状态数据和实现逻辑，将逻辑封装起来，通过return的方式返回外部需要的状态和方法，不同的组件调用同一个hook只是复用了组件的逻辑，并不会共享状态。
- 自定义Hooks都以`use`开头。
```js
import React, {  useState } from 'react';
import ReactDOM from 'react-dom';
// 自定义hook
function useCount(){
  // 公共逻辑放在内部实现
  let [count,setCount] = useState(0);
  const setMyCount = () => {
    setCount(count + 1)
  }
  // 只暴露外部需要的数据
  return [count,setMyCount];
}
// 在不同组件中使用不会共享同一份数据，都是独立的一份
function Example1(){
  // setCount 为自定义hooks中返回的setMyCount
    let [count,setCount] = useCount();
    return (
        <div>
          Count: {count}
          <button onClick={()=>{setCount()}}>更新count</button>
        </div>
    )
}
function Example2(){
    let [count,setCount] = useCount();
    return (
        <div>
          Count: {count}
          <button  onClick={()=>{ setCount()}}>更新count</button>
        </div>
    )
}
ReactDOM.render(<><Example1 /><Example2 /></>, document.getElementById('root'));
```
# 5. Hooks参考周边
- [案例代码]('https://github.com/Wu-Zhichao/learn-react')
- [高质量的自定义hooks库-ahooks]('https://ahooks.js.org/')
- [十个案例学会 React Hooks]('https://github.com/happylindz/blog/issues/19')
- [React Hooks 详解]('https://juejin.cn/post/6844903985338400782#heading-28')

本文首发于微信公众号'前端螺丝钉'