'use strict';

const Service = require('egg').Service;

class SettingService extends Service {
  async lotterySystemcl(value) {
		if (value.state) {
			// 更改系统设置
			await this.app.mysql.query('update clshop_draw_set set state = ?, uid = ? where id = 1', [Number(value.state), value.uid]);
			return { code: 0 }
		} else {
			// 获取系统设置
			let results = await this.app.mysql.query('select * from clshop_draw_set where id = 1')
			return { code: 1, res: results[0] }
		}
	}
	async Systemcl() {

	}
}

module.exports = SettingService;
