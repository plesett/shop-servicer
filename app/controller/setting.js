'use strict';

const Controller = require('egg').Controller;

class SettingController extends Controller {
  async lotterySystemcl() {
		const value = this.ctx.query;
		if (value) {
			const res = await this.service.setting.lotterySystemcl(value);
			switch (res.code) {
				case 0:
					this.ctx.body = { msg: '修改成功', code: 200 }
					break;
			
				case 1:
					this.ctx.body = { msg: 'success', code: 200, data: res.res }
					break;

				default:
					this.ctx.status = 500;
					this.ctx.body = { msg: '服务器错误', code: -1 }
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

module.exports = SettingController;
