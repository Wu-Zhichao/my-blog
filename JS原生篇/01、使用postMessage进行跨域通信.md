> 跨域通信是前端开发中经常会遇到的情景，跨域通信有多种多样的方式，今天就详细说一下使用 postMessage 这样方式进行跨页面脚本的数据通信。

# 一、认识 window.postMessage

根据 MDN 的官方文档解释：window.postMessage() 方法可以安全地实现跨源通信。通常，对于两个不同页面的脚本，只有当执行它们的页面位于具有相同的协议（通常为 https），端口号（443 为 https 的默认值），以及主机 (两个页面的模数 Document.domain 设置为相同的值) 时，这两个脚本才能相互通信。

# 二、使用语法

## 1、向目标窗口发送消息

```
  otherWindow.postMessage(message,targetOrigin)
```

- otherWindow
  > 其他窗口的一个引用，比如 iframe 的 contentWindow 属性、执行 window.open 返回的窗口对象、或者是命名过或数值索引的 window.frames。
- message
  > 将要发送到其他窗口的数据。
- targetOrigin
  > 指定哪些窗口能接收到消息，其值可以是字符串"\*"（表示无限制）或者一个 URI,在发送消息的时候，如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配 targetOrigin 提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。这个机制用来控制消息可以发送到哪些窗口.

## 2、目标窗口接收消息

```
  window.addEventListener("message", receiveMessage, false);
  function receiveMessage(event){
    // event.origin 表示消息的来源地址
    // event.data 表示接收到的数据
    if (event.origin !== 'http: //www.xxxx.com') {
      return
    } else {
      console.log(event.data)
    }
  }
```

# 三、具体案例

#### 父窗口主动给子窗口发消息

> 本案例是在 Vue2.0+iView3.0 的环境下进行,在一个弹框内嵌套一个 iframe 页面。

- 模板
  ```html
  <button @click="show">显示</button>
  <Modal
    v-model="isModalShow"
    width="80%"
    class-name="select_rules_modal"
    footer-hide
    @on-visible-change="visibleModalChange"
  >
    <div class="rules_header">iFrame页面</div>
    <div class="rules_body">
      <iframe
        class="rules_iframe"
        src="http://www.target.com:9900/list"
        id="iframe"
        ref="iframe"
        v-if="isModalShow"
      ></iframe>
    </div>
  </Modal>
  ```
- 逻辑

  ```javascript
  data() {
    return {
      isModalShow: false
    }
  },
  methods: {
    show(){
      this.isModalShow = true
      let iframe = document.getElementById('iframe')
      let data = 'hello'
      if (iframe.attachEvent){ // 兼容IE写法
          // 必须在ifame页面加载完毕后才能发送消息，否则对方接收不到
          iframe.attachEvent("onload", function(){
            // 发消息
            iframe.contentWindow.postMessage(data, 'http://target.com:9900')
          })
        } else {
          iframe.onload = function(){
            // 发消息
            iframe.contentWindow.postMessage(data, 'http://target.com:9900')
        }
      }
      // 收消息(在目标页面进行相关操作，接收发送过来需要的数据)
      window.addEventListener('message',this.receiveMessage,false)
    },
    // 接收消息回调
    receiveMessage(event){
      // 判断是否是目标地址发过来的消息，否则不接收
       if (event.origin !== 'http://target.com:9900') {
        return
      } else {
        // event.data 为接收到的数据
        console.log(event.data)
        // 处理数据.....
        this.isModalShow = false
      }
    },
    // 弹框关闭时移除消息监听
    visibleModalChange(){
      window.removeEventListener('message',this.receiveMessage,false)
    }
  }
  ```

  #### 子窗口主动给父窗口发送消息

  思路： 子窗口无法直接给父窗口发消息，因为存在跨域问题，如果要实现子窗口给父窗口发送消息，需要父窗口先给子窗口发送一个消息，子窗口记住事件源，然后才可以实现发送消息给父窗口。
  1、父窗口在 iframe 加载完后发送消息，并监听子窗口的消息

  ```javascript
  let iframe = document.getElementById("iframe");
  if (iframe.attachEvent) {
    // 兼容IE写法
    iframe.attachEvent("onload", function () {
      // 发消息
      iframe.contentWindow.postMessage(data, "https://yyy.com");
    });
  } else {
    iframe.onload = function () {
      // 发消息
      iframe.contentWindow.postMessage(data, "https://yyy.com");
    };
  }
  // 收消息
  window.addEventListener("message", this.receiveChildMessage, false);
  .......
  receiveChildMessage(event) {
    //.......
  }
  ```

  2、子窗口在页面加载完毕后监听消息，收到消息后保存事件源

  ```javascript
  window.addEventListener("message", this.receiveParentMsg, false);
  .....
  receiveParentMsg(event) {
      if (event.origin !== 'http://xxx.com'){
          return
      }
      // 存储事件源，以便于保存时发消息
      this.parentEvent = event
  },
  ```

  3、事件触发时给父窗口发送消息

  ```javascript
  this.parentEvent.source.postMessage("发送消息", this.parentEvent.origin);
  ```

  4、页面销毁时移除消息监听

  ```javascript
  window.removeEventListener("message", this.receiveParentMsg, false);
  ```

  # 四、注意事项

  1、需要通过`onload`的事件监听`iframe`页面加载完毕后在发生消息，发送接收不到。

  2、一定要在页面关闭的时候移除监听事件，否则会导致在每打开一次`iframe`页面，接收的消息会叠加一次的问题。

  3、如果是父窗口 iframe 加载完后发消息，子窗口页面加载后监听消息，一定要注意子窗口监听消息要在父窗口发消息以前，否则可能收不到消息，放在哪个生命周期中根据自己情况处理。
