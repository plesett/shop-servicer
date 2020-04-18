'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
  async OrderAll() {
    const res = await this.app.mysql.query('select * from clshop_sn');
    return { code: 0, res: res }
  }
  async OrderPayAll(){
    const res = await this.app.mysql.query('select * from clshop_pay');
    return { code: 0, res: res }
  }
}

module.exports = OrderService;
