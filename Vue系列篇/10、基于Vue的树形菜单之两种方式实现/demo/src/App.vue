<template>
  <div id="app">
    <div class="demo-01">
      <h1>递归组件实现</h1>
      <tree-one :treeData='data1'></tree-one>
    </div>
    <div class="demo-02">
      <h1>render函数实现</h1>
      <tree-two :treeData='data2'></tree-two>
    </div>
  </div>
</template>

<script>

import TreeOne from './components/tree-one'
import TreeTwo from './components/tree-two'
export default {
  name: 'app',
  components: {
    TreeOne,
    TreeTwo
  },
  data() {
    return {
      data1: [
        {
          name: 'home',
          path: '/home',
          isExpand: false,
          meta: { text: '首页' }
        },
        {
          name: 'manage',
          path: '/manage',
          isExpand: false,
          meta: {text: '系统管理'},
          children: [
            {
              name: 'staff',
              path: 'staff',
              isExpand: false,
              meta: {text: '员工管理'}
            },
            {
              name: 'role',
              path: 'role',
              isExpand: false,
              meta: {text: '角色管理'}
            },
            {
              name: 'auth',
              path: 'auth',
              isExpand: false,
              meta: {text: '权限管理'}
            },
            {
              name: 'daily',
              path: 'daily',
              isExpand: false,
              meta: {text: '日常管理'},
              children: [
                {
                  name: 'attendance',
                  path: 'attendance',
                  isExpand: false,
                  meta: {text: '考勤管理'},
                },
                {
                  name: 'performance',
                  path: 'performance',
                  isExpand: false,
                  meta: {text: '绩效管理'}
                }
              ]
            }
          ]
        },
        {
          name: 'finance',
          path: '/finance',
          isExpand: false,
          meta: {text: '财务管理'},
          children: [
            {
              name: 'income',
              path: 'income',
              isExpand: false,
              meta: {text: '收入管理'},
            },
            {
              name: 'expense',
              path: 'expense',
              isExpand: false,
              meta: {text: '支出管理'},
            }
          ]
        }
      ],
      data2: [
        {
          name: 'home',
          path: '/home',
          isExpand: false,
          meta: { text: '首页' }
        },
        {
          name: 'manage',
          path: '/manage',
          isExpand: false,
          meta: {text: '系统管理'},
          children: [
            {
              name: 'staff',
              path: 'staff',
              isExpand: false,
              meta: {text: '员工管理'}
            },
            {
              name: 'role',
              path: 'role',
              isExpand: false,
              meta: {text: '角色管理'}
            },
            {
              name: 'auth',
              path: 'auth',
              isExpand: false,
              meta: {text: '权限管理'}
            },
            {
              name: 'daily',
              path: 'daily',
              isExpand: false,
              meta: {text: '日常管理'},
              children: [
                {
                  name: 'attendance',
                  path: 'attendance',
                  isExpand: false,
                  meta: {text: '考勤管理'},
                },
                {
                  name: 'performance',
                  path: 'performance',
                  isExpand: false,
                  meta: {text: '绩效管理'}
                }
              ]
            }
          ]
        },
        {
          name: 'finance',
          path: '/finance',
          isExpand: false,
          meta: {text: '财务管理'},
          children: [
            {
              name: 'income',
              path: 'income',
              isExpand: false,
              meta: {text: '收入管理'},
            },
            {
              name: 'expense',
              path: 'expense',
              isExpand: false,
              meta: {text: '支出管理'},
            }
          ]
        }
      ]
    }
  }
}
</script>

<style>
html,body,#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
}
ul{
  padding-inline-start:20px
}
li{
 list-style: none 
}
h1{
  text-align: left;
}
.demo-01{
  flex: 1;
  border-right: 1px solid #ccc;
  padding: 0 15%;
}
.demo-02{
  flex: 1;
  padding: 0 15%;
}
</style>
