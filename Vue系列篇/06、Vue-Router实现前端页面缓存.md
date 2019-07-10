# 一、使用情景
在使用`Vue`开发单页面应用时，我们通常会使用`Vue-Router`进行页面导航，`Vue-Router`在进行路由切换的时候，页面是会重新加载，对应的生命周期函数也会再次执行一遍，但是在有些业务场景下，
比如：
 * 在有分页数据列表中，切换到第三页需要查看列表对应数据的详情页面，然后返回，如果不加任何处理，列表页面会重新加载，默认显示第一页数据，而不在是之前的第三页，这样如果还需要查看之前查看数据的下一条时，还需要切换到第三页，如此反复。
 * 在列表页面进行条件筛选查询，查询到对应的数据后查询详情，跳转详情页面，然后在返回，列表默认会清空查询条件，显示所有数据。

以上两种情景都会带来很不好的用户体验。此时，就需要对列表页面进行路由缓存。在`Vue-Router`中可以使用`keep-alive`进行路由页面缓存。

# 二、keep-alive基本认识
 * `Vue`中提供了一个内置组件`keep-alive`，使用`<keep-alive>`元素将动态组件包裹起来，内部组件就会被缓存起来。
 * `<keep-alive>`包裹的组件，加载过的页面，再次进入时，是不会执行页面第一次进入时的部分生命周期函数。
 * `<keep-alive>`包裹的组件会新增两个生命周期函数`activated`和`deactivated`.
 * 两个属性`include`和`exclude`可以让`<keep-alive>`实现有条件的进行缓存。`include`包含的组件会被进行缓存，`exclude`包含的组件不会被缓存。


# 三、keep-alive实现路由页面缓存
通过`keep-alive`实现路由页面缓存有两种如下两种方式：

## （一）、使用`include`控制需要缓存的页面
```html
// home.vue
<template>
 <div>
   ...
  <keep-alive :include='cashViews'>
    <router-view></router-view>
  </keep-alive>
 </div>
</template>  
<script>
  export default{
    data() {
      return {
        // 要缓存的组件
        cashViews: ['list']
      }
    }
  }
</script>    
```
```html
// list.vue
<script>
  export default{
    // 在组件内路由守卫钩子函数中处理逻辑
    beforeRouteEnter (to, from, next) {
      if (from.name === 'Index') { // 处理页面缓存后，返回首页再次进入缓存页时数据为更新
        // 该生命周期无法获取到this，因此把vm实例当作参数传递
        next(vm => {
          vm.pages.pageNum = 1
          // 因为我这里查询表单是动态的，所以首页进入时需要调用一次，在改方法中请求返回后调用了获取列表数据getTableDatas方法
          vm.getQueryList()
        })
      } else if (!from.name) { // 处理刷新页面时，获取动态表单方法未执行，导致表单无法加载
        next(vm => {
          vm.getQueryList()
        })
      } else {
        // 详情返回时只更新列表数据，因为如果在详情页面做了操作，列表数据状态会改变，其他使用缓存
        next(vm => {
          vm.getTableDatas()
        })
      }
    }
  }
</script>
```
以上实现，是针对我自己项目业务场景的实现，如果查询表单不是动态获取的，是页面写死的，可以在`activated`钩子中调用查询列表数据方法。这样每次进入的缓存页面的时候，只会更新列表数据，不会改变其他缓存。

` 问题`：同样会存在，列表缓存数据后，返回首页，再次进入列表页面，缓存数据还在，这样可以在路由守卫`beforeRouterLeave`钩子中处理。
```javascript
  activated() {
   this.getTableDatas()
  },
  beforeRouterLeave(to, from, next) {
  if (from.name === 'Index') {
    // 如果从首页进入时调用重置方法
    this.reset()
  }
}
```
* 两点注意：

  * 要缓存的路由组件必须设置`name`属性，跟`cashViews`中的值对应；
  * 如果要缓存的组件比较多时，可以使用`vuex`管理`cashViews`。

## （二)、根据`v-if`控制显示的`router-view`
1. 在路由表`routes`中配置`meta`属性，新增`keepAlive`属性，需要缓存的页面设置`keepAlive`为`true`.
```javascript
{
  path: '/list',
  name: 'List',
  component: List,
  meta: {
    keepAlive: true
  }
}
```
2. 根据当前访问路由的`keepAlive`值控制是否缓存组件
```html
// home.vue
<template>
  ...
  <keep-alive>
    <router-view v-if="$route.meta.keepAlive"></router-view>
  </keep-alive>
  <router-view v-if="!$route.meta.keepAlive"></router-view>
</template>
```
3. 在组件的守卫钩子中修改`keepAlive`的值，控制页面缓存与否
```javascript
// List.vue
export default {
  /* 从List组件离开时,修改keepAlive值为false，保证进入该页面时页面刷新
  */
  beforeRouteLeave(to, from, next) {
    from.meta.keepAlive = false
    next()
  }
}
```
```javascript
// Detail.vue
export default {
  /*从Detail返回List时，修改List的keepAlive为true,确保返回List页面时使用缓存不刷新页面
  */
  beforeRouteLeave(to, from, next){
    if(to.name === 'List') {
      to.meta.keepAlive = true
    }
    next()
  }
}
```