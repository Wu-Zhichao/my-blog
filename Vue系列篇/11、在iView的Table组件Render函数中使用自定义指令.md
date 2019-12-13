在`iview`的`Table`组件中，`render`函数非常好用，可以极大程度的解决定制化的需求。那么自定义指令在`render`函数中如何使用呢？且看下面分解。
# 自定义指令
以下以一个防止按钮快速重复点击为例
* 新建一个一个js文件，定义自定义指令
```javascript
// preventReClick.js
import Vue from 'vue'
Vue.directive('preventReClick', {
  inserted(el, binding) {
    el.addEventListener('click',() => {
      if (!el.disabled) {
        el.disabled = true
        setTimeout(() => {
          el.disabled = false
        },2000)
      }
    })
  }
})
```
* 全局引入自定义指令
```javascript
// main.js
import "@/directive/preventReClick";
```
# 在Render函数中使用自定义指令
```javascript
columns: [
  {
    title: '已匹配合同人数',
    key: 'matchCount',
    minWidth: 80,
    render: (h,params) => {
      return h('div',{
        style: {
          display: 'flex',
          justifyContent: 'space-between'
        }
      },[
        h('span',params.row.matchCount),
        h('Button',{
          style: {
            display: params.row.canPress && (Number(params.row.numberCount) > params.row.matchCount) ? 'inline-block' : 'none',
            height: '24px',
            padding: '0 5px'
          },
          on: {
            click: async() => {
              let data = {
                incomeBatchId: params.row.id,
                settlementId: params.row.settlementId
              }
              let res = await pressToMatchContract(data)
              if (res.code === 10200 && res.isSuccess) {
                this.$Message.success('催办成功')
              } else {
                this.$Modal.error({
                  title: '错误',
                  content: res.message
                })
              }
            }
          },
          // 使用自定义指令
          directives: [
            {
              name: 'setTimeClick',
              // 如有其他参数可以在此添加
            }
          ]
        },'催办')
      ])
    }
  },
]
```