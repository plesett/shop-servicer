'use strict';

const Controller = require('egg').Controller;

/**
 * https://user.ihuyi.com/nav/sms.html
 * 
 */

class SmsController extends Controller {
  async send() {
    const code = Math.floor(Math.random () * 900) + 5541;
    const { mobile, type } = this.ctx.query;
    // 判断是否为忘记密码操作
    if (type !== 'forget') {
      // 调用服务该手机是否存在数据库，存在则注册过了
      const resMobile = await this.service.login.GetMobile(mobile)
      // 2 为注册过 0 未注册
      if (resMobile.code === 2) {
        // 已经注册过
        this.ctx.body = {
          code: 203,
          msg: '该手机已经注册'
        }
        return
      } 
    }
    // 防止刷短信
    // if (await this.service.cache.get(`${mobile}_code`) !== null) {
    //   this.ctx.body = {
    //     msg: '请稍后重试'
    //   }
    //   return
    // }
    // 测试环境 -------------------------------------
    console.log(`----------${code}---------`);
    // 保存验证码到 redis 
    await this.service.cache.set(`${mobile}_code`, code, 60) // 1分钟后失效
    // 测试环境 ------------------------------------- 
    const url = "https://106.ihuyi.com/webservice/sms.php";
    const account = "C79987335"; // APIID
    const password = "a0408b48ccf92abdf51d3e80e61a7164";  // APIKEY
    const content = `您的验证码是：${code}。请不要把验证码泄露给其他人。`; // 与 https://user.ihuyi.com/nav/sms.html 模板相同
    // const res = await this.ctx.curl(`${url}?method=Submit&account=${account}&password=${password}&mobile=${Number(mobile)}&content=${content}`)
    // if (res.status === 200) {
    //     this.service.cache.set(mobile, code, 180) // 3分钟后失效
    //     this.ctx.body = {
    //         code: 3,
    //         msg: '发送成功'
    //     }
    // } else {
    //   this.ctx.body = {
    //       msg: '异常'
    //   }
    // }
    // ---------- 以下为测试 ------
    this.ctx.body = {
      code: 3,
      msg: '发送成功',
      verify: code
    }
  }
}

module.exports = SmsController;
