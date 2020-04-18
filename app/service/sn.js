'use strict';

const Service = require('egg').Service;

class SnService extends Service {
  async push(uid, total, data) {
    // 调用服务查询 data 的product_id 对应的商品价格
    let obj = [];
    let db_total = 0;
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        let result = await this.app.mysql.select("clshop_product",{
          where:{ product_id: Number(element.product_id) }
        })
        db_total+=element.countValue
        obj.push(Object.assign(result[0], { countValue: element.countValue, upfile: result[0].upfile }))
    }
    if (db_total === Number(total)) {
        try {
            // 查询余额
            let user_info = await this.app.mysql.query('select balance, mobile, nickname from clshop_user where uid = ?',[ uid ])
            // 扣除该用户的 余额
            await this.app.mysql.query('update clshop_user set balance = ? where uid = ?',[ user_info[0].balance - db_total, uid]);
            // 写入订单表
						const sn_id = Math.floor(Math.random() * 24151566);
            for (let i = 0; i < obj.length; i++) {
								const element = obj[i];
                await this.app.mysql.insert("clshop_sn",{
                    sn: sn_id,  // 随机生成八位订单号
                    count: element.countValue, 
                    product: element.title,
                    price: element.price,
                    product_id: element.product_id,
                    uid: uid,
                    mobile: user_info[0].mobile,
                    nickname: user_info[0].nickname,
                    pay_state: 0,
                    upfile: element.upfile
								})
								// 查询商品参与人数
								let yicanyu = await this.app.mysql.query('select yicanyu from clshop_product where product_id = ?',[ element.product_id ])
								// 写入商品参与人数
								await this.app.mysql.query('update clshop_product set yicanyu = ? where product_id = ?',[ yicanyu[0].yicanyu + element.countValue, element.product_id]);
            }
						return { code: 0 }
        } catch (error) {
            return { code: -1 }
        }
    } else {
        return { code: 6 }
    }
  }
}

module.exports = SnService;
