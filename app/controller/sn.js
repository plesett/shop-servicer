'use strict';

const Controller = require('egg').Controller;

class SnController extends Controller {
  async push() {
    // 接收参数
    let { uid, total, data } = this.ctx.query;
    if (Boolean(uid&& total&& JSON.parse(data))) {
        // 调用服务校对
        let res = await this.service.sn.push(uid, total, JSON.parse(data));
        switch (res.code) {
            case 0:
                this.ctx.body = {
                    code: 200,
                    msg: '支付成功'
                }
                break;
            case -1:
                this.ctx.status = 500;
                this.ctx.body = {
                    code: 500,
                    msg: '服务器错误'
                }
                break;
            case 6:
                this.ctx.status = 403;
                this.ctx.body = {
                    msg: '非法请求'
                }
                break;
        
            default:
                break;
        }
    } else {
        this.ctx.body = {
            code: 201,
            msg: '参数不完整'
        }
    }
  }
}

module.exports = SnController;
