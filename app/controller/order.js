'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
  async OrderAll() {
    const res = await this.service.order.OrderAll();
    switch (res.code) {
        case 0:
            this.ctx.body = {
                code: 200,
                msg: 'success',
                data: res.res
            }
            break;
    
        default:
            this.ctx.status = 500;
            this.ctx.body = {
                code: -1,
                msg: '服务器错误'
            }
            break;
    }
  }
  // 获取全部充值订单
  async OrderPayAll() {
    const res = await this.service.order.OrderPayAll();
    switch (res.code) {
      case 0:
        this.ctx.body = {
          code: 200,
          msg: 'success',
          data: res.res
        }
        break;

      default:
        this.ctx.status = 500;
        this.ctx.body = {
          code: -1,
          msg: '服务器错误'
        }
        break;
    }
  }
}

module.exports = OrderController;
