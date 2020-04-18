'use strict';

const Service = require('egg').Service;

class NoticeService extends Service {
  async notice() {
    let result = await this.app.mysql.query('select * from clshop_notice');
    return result;
  }
  async update(ArrNotice) {
    try {
      for (let i = 0; i < ArrNotice.length; i++) {
        const element = ArrNotice[i];
        let res = await this.app.mysql.query('update clshop_notice set notice = ? where id = ?', [element.notice, element.id]);
      }
      return { code: 0 };
    } catch (error) {
      return { code: -1 };
    }
  }
}

module.exports = NoticeService;
