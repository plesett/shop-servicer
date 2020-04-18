'use strict'

/**
 * @param {Egg.Application} app - egg application
 * 
 */
module.exports = app => {
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.get('/test', controller.home.test)
  // 用户注册
  router.post('/register', controller.login.register)
  // 登录
  router.post('/login', controller.login.login)
  // 注销
  router.post('/login_out', controller.login.loginOut)
  // 商品
  router.get('/product_list', controller.product.info)
  // 获取商品详情
  router.get('/product_details', controller.product.details)
  // 获取首页展示信息
  router.get('/notice', controller.notice.notice)
  // 开奖
  router.get('/lottery', controller.lottery.lottery)
  // 历史开奖信息
  router.get('/lottery/forget', controller.lottery.forget)
  // 分类商品
  router.get('/classify_menu', controller.classify.classifyMenu)
  // 获取分类商品(即将揭晓)
  router.get('/classify_unveiled', controller.classify.unveiled)
  // 获取分类商品(最新)
  router.get('/classify_new', controller.classify.new)
  // 获取分类商品(人气)
  router.get('/classify_moods', controller.classify.moods)
  // 获取分类商品(价格 max|min)
  router.get('/classify_price', controller.classify.price)
  // 发送短信
  router.get('/sms', controller.sms.send)
  // 忘记密码
  router.post('/forgetPass', controller.login.forGetPass)
  // ----------------以下路由需登录操作----------------
  // 获取用户基本信息
  router.get('/user/info', controller.login.loginInfo)
  // 修改用户信息
  router.put('/user/update', controller.user.update)
  // 修改密码
  router.post('/user/password', controller.user.updatePass)
  // 提交订单
  router.post('/shop/sn', controller.sn.push)
  // 用户获得所有的商品记录
  router.get('/user/record', controller.user.record)
  // 用户获得的商品
  router.get('/user/shops', controller.user.shops)
  // 充值接口
  router.post('/user/pay', controller.alipay.index)
  // 支付成功异步通知地址
  router.post('/pay/notify', controller.alipay.notify)
  // 用户检查是否充值成功
  router.post('/pay/examine', controller.alipay.examine)
  // ----------------以下路由为后台 需登录操作----------------
  // 获取单个
  router.get('/get/product', controller.product.single)
  // 删除单个
  router.delete('/delete/product', controller.product.delete)
  // 更新单个
  router.put('/update/product', controller.product.update)
  // 获取上传七牛图片的 token
  router.get('/upload', controller.product.upload)
  // 添加商品
  router.get('/create/product', controller.product.create)
  // 获取用户 列表
  router.post('/get/user', controller.user.UserList)
  // 删除用户
  router.delete('/delete/user', controller.user.UserDelete)
  // 获取单个用户信息
  router.post('/user/info', controller.user.UserInfo)
  // 编辑用户
  router.put('/user/info/update', controller.user.UserUpdata)
  // 获取用户订单
  router.get('/get/order', controller.order.OrderAll)
  // 获取机器人订单
  router.get('/get/order/npc', controller.lottery.lotteryNPCAll)
  // 获取充值订单
  router.get('/get/order/pay', controller.order.OrderPayAll)
  // 获取系统设置
  router.get('/get/setting', controller.setting.lotterySystemcl)
  // 更改系统设置
  router.put('/get/setting', controller.setting.lotterySystemcl)
  // 获取首页展示信息 update
  router.put('/notice', controller.notice.update)
}
