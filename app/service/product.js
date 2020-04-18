'use strict';

const Service = require('egg').Service;

class ProductService extends Service {
  // 获取商品列表
  async info() {
  
  }
  // 查询商品详情
  async detail(product_id, type) {
		try {
			// 查询数据库
			let result = await this.app.mysql.select("clshop_product",{
    	  		where:{ product_id: product_id }
			});
			// 获得商品中奖者信息
			let res_winners = await this.app.mysql.query("SELECT username, mobile, gonumber, winner_end_time FROM clshop_winners ORDER BY RAND() LIMIT 8");
			// 查询错误 处理
			if (result[0] === undefined) {
				return { code: -1 }
			} else {
				if (type === 'single') {
					return { code: 0, res: result }
				}
				return { code: 0, res: result, winners: res_winners }
			}
		} catch (error) {
			return { code: -1 }
		}
  }
  // 新增商品
  async create(value) {
	try {
		await this.app.mysql.insert("clshop_product",{
			status: value.status,
			classify: value.classify,
			yicanyu: value.yicanyu,
			title: value.title,
			price: value.price,
			zongcanyu: value.zongcanyu,
			upfile: value.upfile
		})
		return { code: 0 }
	} catch (error) {
		return { code: -1 }
	}
  }
  // 更新商品
  async update(value) {
		try {
			const data = eval("("+value+")");
			// 更新数据库
			await this.app.mysql.query(
				'update clshop_product set title = ?, upfile = ?, price = ?, status = ?, zongcanyu = ?, yicanyu = ?, classify = ? where product_id = ?',
				[
					data.title, 
					data.upfile,
					data.price,
					data.status,
					data.zongcanyu,
					data.yicanyu,
					data.classify,
					data.product_id
				]
			);
			return { code: 0 }
		} catch (error) {
			return { code: -1 }
		}
  }
  // 删除商品
  async delete(product_id) {
	try {
		await this.app.mysql.delete('clshop_product',{ product_id: product_id })
		return { code: 0 }
	} catch (error) {
		return { code: -1 }
	}
	}
}

module.exports = ProductService;
