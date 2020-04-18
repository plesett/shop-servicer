'use strict';

const Controller = require('egg').Controller;

class ClassifyController extends Controller {
	// 分类
  async classifyMenu() {
		// 获取参数
		const { classify_code } = this.ctx.query;
		// 校验参数
		if (classify_code) {
			// 调用服务查询是否存在
			const db_res = await this.service.classify.classifyMenu(classify_code)
			this.ctx.body = this.app.ErrorCapture(db_res);
		} else {
			this.ctx.status = 403;
    		this.ctx.body = {
				code: 201,
				msg: '参数不完整'
			};
		}
	}
	// 即将揭晓
	async unveiled() {
		// 获取参数
		const { classify_code } = this.ctx.query;
		if (classify_code) {
			// 按照分类编码来排序
			const db_res = await this.service.classify.unveiled_classify(classify_code);
			this.ctx.body = this.app.ErrorCapture(db_res);
		} else {
			// 全部
			const db_res = await this.service.classify.unveiled();
			this.ctx.body = this.app.ErrorCapture(db_res);
		}
	}
	// 人气
	async moods() {
		// 获取参数
		const { classify_code } = this.ctx.query;
		// 判读是否携带参数
		if (classify_code) {
			// 按照分类编码来获得人气排序
			const db_res = await this.service.classify.moods_classify(classify_code);
			this.ctx.body = this.app.ErrorCapture(db_res);
		} else {
			// 全部
			const db_res = await this.service.classify.moods();
			this.ctx.body = this.app.ErrorCapture(db_res);
		}
	}
	// 最新
	async new() {
		// 获取参数
		const { classify_code } = this.ctx.query;
		// 判读是否携带参数
		const db_res = await this.service.classify.new_classify(classify_code);
		this.ctx.body = this.app.ErrorCapture(db_res);
	}
	// 价格 
	async price(){
		// 接收参数
		const { classify_code, type } = this.ctx.query;
		if (classify_code && type) {
			const db_res = await this.service.classify.price(classify_code, type)
			this.ctx.body = this.app.ErrorCapture(db_res);
		} else {
			// 全部商品的价格
			if (type === 'asc') {
				// 调用服务获取最低价格排序
				const db_res = await this.service.classify.price(null , type)
				this.ctx.body = this.app.ErrorCapture(db_res);
			}	
			else if(type === 'desc'){
				// 调用服务获取最高价格排序 desc
				const db_res = await this.service.classify.price(null, type)
				this.ctx.body = this.app.ErrorCapture(db_res);
			}
			else {
				this.ctx.status = 400
				this.ctx.body = {
					code: -1,
					msg: '参数错误'
				}
			}
		}
	}
}

module.exports = ClassifyController;
