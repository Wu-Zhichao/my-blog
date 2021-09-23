const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const app = new Koa()
const router = new Router()
// 鉴权中间件
const auth = async (ctx, next) => {
  if (ctx.url !== '/users') {
    ctx.throw(401)
  }
  await next()
}

// 实例化用户路由
const usersRouter = new Router({prefix: '/users'})
// 处理不同的url
router.get('/users?name=张三',ctx => {
  console.log(ctx.query.name)
})
// 处理用户路由
usersRouter.get('/',auth,ctx => {
  ctx.body = '用户列表'
})
// 处理不同的请求方法
usersRouter.post('/',auth,ctx => {
  ctx.body = '创建用户'
})
// 解析参数
usersRouter.get('/:id',auth,ctx => {
  ctx.body = `用户${ctx.params.id}`
})
// 注册koa-router中间件
app.use(router.routes())
app.use(usersRouter.routes())
app.use(usersRouter.allowedMethods())
app.use(bodyparser())
app.listen(3000)