# 1. 出现场景
在微信小程序中，可以使用`webview`嵌套`web`页面，有些时候在`web`页面填写了表单没有提交，当用户点击左上角小程序的返回时，希望可以弹框提示用户还有未保存内容，是否确定返回，根据用户选择之后在确定是否返回。

# 2. 遇到困难
由于返回图标是微信小程序自带的，因此我们无法通过`web`页面的路由离开钩子(如：vue中beforeRouterLeave钩子函数)来控制页面是否关闭，因此想要在离开页面时在`web`页面进行逻辑控制是有难度的。

# 3. 解决办法
使用浏览器的`popstate`事件来禁止页面跳转。
```js
history.pushState(null, null, document.URL)
```

# 4. 项目实战
```html
<template>
  <!-- 表单 -->
  ......
  <!-- 此处示例使用vantUI的弹框组件 -->
  <van-dialog
    v-model="isBackWarnShow"
    title="温馨提示"
    show-cancel-button
    confirmButtonColor="#3DB754"
    className="back-warn-dialog"
    @confirm="handleComfirmBack"
    @cancel="handleCancelBack"
  >
    <div>您的信息还未提交认证，</div>
    <div>确定返回吗？</div>
  </van-dialog>
</template>
<script>
export default {
  data() {
    return {
      // 表单信息
      formData: {
        name: '',
        age: ''
      },
      // 提示是否显示
      isBackWarnShow: false,
      // 是否放弃提交
      isQuitSubmit: false
    }
  },
  mounted() {
      history.pushState(null, null, document.URL)
      // 点击小程序返回时会触发popstate事件
      window.addEventListener('popstate', this.handlePopstate)
  },
  beforeDestroy() {
    window.removeEventListener('popstate', this.handlePopstate)
  },
  // 点击小程序返回
  handlePopstate() {
    if (
      !this.isQuitSubmit &&
      (this.formData.name ||
        this.formData.age)
    ) {
      // 表单信息未提交阻止返回
      history.pushState(null, null, document.URL)
      this.isBackWarnShow = true
    } else {
      // 返回到小程序
      wx.miniProgram.navigateBack({
        delta: history.length
      })
    }
  },
  handleComfirmBack() {
      this.isQuitSubmit = true
      this.isBackWarnShow = false
      // 弹框确定后返回小程序
      wx.miniProgram.navigateBack({
        delta: history.length
      })
    },
    handleCancelBack() {
      // 弹框取消留在当前页面
      this.isQuitSubmit = false
      this.isBackWarnShow = false
    }
}
</script>
```