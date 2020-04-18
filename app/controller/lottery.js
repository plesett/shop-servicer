'use strict';

const Controller = require('egg').Controller;
const dayjs = require('dayjs');

class LotteryController extends Controller {
  // 开奖信息 
  async lottery() {
    // 查看 redis 中是否存在开奖信息
    const resWinners = await this.service.cache.get('winners');
    if ( resWinners === null ) {
        // 表示开奖信息过期
        // 调用服务获取 用户数据、商品数据
        const res = await this.service.lottery.lottery();
        if (res.code === 0) {
            // 组装
            var lottery_object = [];
            // 循环遍历出 npc product 对象
            for (let i = 0; i < res.npc.length; i++) {
                const element = res.npc[i];
                var d = []
                for (let m = 0; m < res.product.length; m++) {
                    const n = res.product[m];
                    d.push(n)
				}
                const b = {
					winner_end_time:  Date.now() + 1000 * 60 * 2, // this.app.CountTime(dayjs().format('YYYY-MM-DD HH:mm'), 3), // 生成2分钟后时间戳
					state: 0, // 开奖状态
					yun_code: Math.round(Math.random() * 65421), // 云
                    good_code: this.app.createRandomId(), // 幸运码
                    gonumber: this.app.setRnd(), // 次数
                    end_time: new Date().toLocaleString() // 结束时间
                }
                lottery_object.push(Object.assign(d[i], Object.assign(element, b)))
            }
            // 存入 redis 
            this.service.cache.set('winners', lottery_object, 60);
            // 调用服务存入数据库
            const resSave = this.service.lottery.Savelottery();
            if (resSave.code === -1) {
                this.ctx.body = {
                    code: -1,
                    msg: '数据库错误',
                }
                return
            }
            this.ctx.body = {
                code: 200,
                msg: 'success',
                data: lottery_object
            }
        } else {
            this.ctx.body = {
                code: -1,
                msg: '服务器错误'
            }
        }
    } else {
        this.ctx.body = {
            code: 200,
            msg: 'success',
            data: resWinners
        }
    }
  }
  // 历史中奖信息
  async forget() {
		// 获取参数
		const { page, per_page } = this.ctx.query;
		// 校验参数
		if (page) {
			// 调用服务获取数据
			let resForget = await this.service.lottery.forget(page, per_page)
			if (resForget.code === 0) {
				this.ctx.body = {
					code: 200,
					msg: 'success',
					data: resForget.data
				}
			}
		} else {
			this.ctx.body = {
				code: 201,
				msg: '缺少参数'
			}
		}
  }
  async lotteryNPCAll(){
      let res = await this.service.lottery.lotteryNPCAll()
      this.ctx.body = {
          code: 200,
          msg: 'success',
          data: res.data
      }
  }
}

module.exports = LotteryController;
