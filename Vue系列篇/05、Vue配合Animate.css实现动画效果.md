> 在Vue中可以通过过度`transition`配合`animation`实现自定义动画效果，但是需要对`css3`非常熟悉才能实现想要的效果。大家都知道有一个`css`动画库`animate.css`里面有丰富的动画效果，简单易用。那么在Vue中该如何使用呢？且看下面分享。
# 一、npm安装animate.css
```
 npm install animate.css --save
```
# 二、在组件中引入,并控制动画元素的显示消失
> 元素是在显示和消失的时候才会显示出动画，需要对动画作用的元素是否显示进行控制
```javascript
<script>
  import animate from 'animate.css'
  export default {
    data() {
      return {
        isShow: false
      }
    },
    methods: {
      show() {
        this.isShow = true
      },
      hide() {
        this.isShow = false
      }
    }
  }
</script>
```
# 三、给动画组件添加过渡的类名绑定动画效果
```javascript
<button @click="show">进入</button>
<button @click="hide">离开</button>

<transition
  // 进入动画
  enter-active-class="animated bounceInDown"
  // 离开动画
  leave-active-class="animated bounceOutRight"
  <div class='content' v-show="isShow">
    <p>我是动画显示的内容</p>
  </div>
</transition>
```