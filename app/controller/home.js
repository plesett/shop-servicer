'use strict';

const Controller = require('egg').Controller;
const fs = require('fs')
const path = require('path')

class HomeController extends Controller {
  async index() {

    // const filePath = path.resolve(this.app.config.static.dir, 'hello.txt');
    // this.ctx.attachment('hello.txt');
    // this.ctx.set('Content-Type', 'application/octet-stream');
    // this.ctx.body = fs.createReadStream(filePath);
    this.ctx.body = {
      msg: 'ok'
    }
  }
  async test() {
    const { ctx } = this;
    // 获取ip
    let host = ctx.request.header.host;
    // 查询redis
    let count = await this.service.cache.get(host)
    // 加1保存
    await this.service.cache.set(host, count + 1, 10)
    // 查询操作
    // let result = await this.app.mysql.query(`select username, mobile, upfile, balance, login_time, state, nickname, sex, uid from clshop_user where mobile=18226764519 and state=0;`);
    console.log(`被请求${await this.service.cache.get(host)} 次`);
    ctx.body =  {
      msg: '这里是测试接口',
      count: await this.service.cache.get(host),
      data: await this.service.index.index(),
      result: result[0]
    }
  }
}

module.exports = HomeController;
