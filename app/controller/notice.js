'use strict';

const Controller = require('egg').Controller;

class NoticeController extends Controller {
  async notice() {
    let { ctx } = this;
    let index_info = await this.service.notice.notice();
    ctx.body = {
        code: 200,
        data: index_info
    }
  }
  async update() {
    let { ctx } = this;
    let { value } = ctx.query;
    let data = eval("(" + value + ")");
    let index_info = await this.service.notice.update(data);
    switch (index_info.code) {
      case 0:
        ctx.body = {
          code: 200,
          msg: 'success'
        }
        break;

      case -1:
        ctx.status = 401;
        ctx.body = {
          code: -1,
          msg: '报错失败'
        }
        break;
    
      default:
        ctx.status = 500;
        ctx.body = {
          code: -1
        }
        break;
    }
  }
}

module.exports = NoticeController;
