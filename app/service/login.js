'use strict';

const Service = require('egg').Service;
const dayjs = require('dayjs');

class LoginService extends Service {
  // 用户登录
  async login(mobile, password) {
    // 从数据库中拿出对应 mobile 的密码
    let resDB = await this.app.mysql.select("clshop_user",{
      where: { mobile: mobile}
    })
    if ( resDB[0] === undefined) {
      // 没有查询到此用户
       return { code: 2}
    } else {
      // 从数据库拿出 手机号码、密码
      const DB_mobile = resDB[0].mobile;
      const DB_pass = resDB[0].password;
      // 解密 出来的 password
      const DecPass = this.app.Decrypt(DB_pass)
      if ( DecPass ===  password && DB_mobile === Number(mobile)) {
        // 对比通过
        // 登录时间
        await this.app.mysql.query('update clshop_user set login_time = ? where mobile = ?',[dayjs().format('YYYY-MM-DD HH:mm'),Number(mobile)]);
        return { code: 0 }
      } else {
        // 对比错误1
        return { code: -1 }
      }
    }
  }
  // 用户注册
  async register(mobile, password) {
    // 捕获异常
    try {
      // 存入数据库操作
      await this.app.mysql.insert("clshop_user",{ mobile: Number(mobile), password: password, uid: Math.floor(Math.random () * 900) + 35412 })
      // 返回信息
      return { code: 0} 
    } catch (error) {
      // 错误处理
      return { code: -1 } 
    }
  }
  // 查询操作 mobile
  async GetMobile(mobile) {
    let result = await this.app.mysql.get("clshop_user", { mobile: mobile })
    if (result !== null) {
      // 该手机号已经注册
      return { code: 2 }
    } else {
      // 暂未注册
      return { code: 0 }
    }
  }
  // 查询用户信息
  async loginInfo(mobile){
    try {
      let result = await this.app.mysql.query(`select username, mobile, upfile, balance, login_time, inform, state, nickname, sex, uid from clshop_user where mobile=${mobile} and state=0;`);     
      return { code: 0, res:  result[0]}
    } catch (error) {
      return { code: -1, error: error }
    }
  }
  // 忘记密码
  async forgetPass(mobile, pass, code) {
    // 校验code
    let redisCode = await this.service.cache.get(`${mobile}_code`);
    if (redisCode === Number(code)) {
      try {
        // 修改密码
        await this.app.mysql.query('update clshop_user set password = ?  where mobile = ?',[this.app.Encrypt(pass), mobile]);
        return { code: 0 }
      } catch (error) {
        return { code: -1, error: error }
      }
    } 
    return { code: 4 }
  }
}

module.exports = LoginService;
