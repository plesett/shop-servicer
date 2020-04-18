'use strict';

const Service = require('egg').Service;

class LotteryService extends Service {
  _result = [];
  // 获取开奖信息   用于开发阶段展示
  async lottery() {
      try {
        // 数据库随机获取商品数据
        let resNPC = await this.app.mysql.query('select username, mobile from clshop_lottery_npc order by rand() limit 5');
        let resProduct = await this.app.mysql.query('select title, upfile, price from clshop_product where status=0 order by rand() limit 5');
        return {
            code: 0,
            npc: resNPC,
            product: resProduct
        }
      } catch (error) {
           // 错误处理
           return { code: -1 }
      }
  }
  // 存入数据
  async Savelottery() {
    // 查询redis
    const resWinners = await this.service.cache.get('winners');
    // 存入数据库
    for (let i = 0; i < resWinners.length; i++) {
      const element = resWinners[i];
      try {
        await this.app.mysql.insert("clshop_winners",{ 
          winner_end_time: element.winner_end_time,
          state: 1,
          title: element.title,
          upfile: element.upfile,
          price: element.price,
          username: element.username,
          mobile: element.mobile,
          good_code: Number(element.good_code),
          gonumber: Number(element.gonumber),
          yun_code: element.yun_code,
          end_time: element.end_time
        })
      } catch (error) {
        return { code: -1 }
      }
    }
  }
  // 获取历史中奖信息
  async forget(page, per_page) {
    let result = await this.app.mysql.query(`select * from clshop_winners order by id desc limit ${ page },${ per_page === undefined ? 11 : per_page }`);
    return { code: 0, data: result }
  }
  // 获取所有机器人已开奖订单
  async lotteryNPCAll() {
    let result = await this.app.mysql.query(`select * from clshop_winners order by id desc`);
    return { code: 0, data: result }
  }
  // 开奖 
  async lotterySet() {
    console.log('准备开奖');
    // 查询
    let result = await this.app.mysql.query('select * from clshop_product where zongcanyu < (yicanyu + 1)');
    // 查询不到则返回
    if (result.length === 0) return;
    // 查询到要开奖的商品，然后去订单中查询所有与之相同的商品id的订单，随机生成一位中奖者
    const product_ID = [];
    // 获取开奖的商品id
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      product_ID.push({
        product_id: element.product_id, 
        upfile: element.upfile
      })
      // 将商品参数人数重置
      await this.app.mysql.query('update clshop_product set yicanyu = 0 where product_id = ?',[element.product_id]);
    }
    
    // 中奖者信息
    let winner_uid = [];
    let winner_product_id = [];
    // 去订单表查询所有的数据，除去已经开过将的状态 即 state
    for (let d = 0; d < product_ID.length; d++) {
      const id = product_ID[d].product_id;
      // let result = []
      // 查询表是否存在必中
      let draw = await this.app.mysql.query('select uid, state from clshop_draw_set');
      // 查询是否存在必中uid的商品
      let result_draw = await this.app.mysql.query("SELECT * FROM clshop_sn WHERE product_id = ? and state=0 and uid = ? LIMIT 1", [id, draw[0].uid]);  

      if (Boolean(result_draw[0])) {
        this._result.push(result_draw[0])
      } else {
        switch (draw[0].state) {
          case 0:
            console.log('随机中奖');
            // -----------随机中奖-------------
            let result_random = await this.app.mysql.query("SELECT * FROM clshop_sn WHERE product_id = ? and state=0 ORDER BY RAND() LIMIT 1", [id]);
            this._result.push(result_random[0])
            break;
          case 1:
            console.log('比例中奖');
            // -----------比例中奖-------------
            let result_ratio = await this.app.mysql.query('SELECT * FROM clshop_sn where product_id = ? order by count DESC LIMIT 1', [id]);
            this._result.push(result_ratio[0])
            break;
          case 2:
            // -----------机器人中奖-------------
            this.service.lottery.lotterySetNPC(product_ID)
            return;
          default:
            console.log('默认中奖');
            // -----------随机中奖-------------
            let result = await this.app.mysql.query("SELECT * FROM clshop_sn WHERE product_id = ? and state=0 and id >= (SELECT floor(RAND() * (SELECT MAX(id) FROM clshop_sn))) ORDER BY id LIMIT 1", [id]);
            this._result.push(result[0])
            break;
        }
      }
      winner_uid.push(this._result[0].uid)
      winner_product_id.push(this._result[0].product_id)
      // 把中奖订单的state改成中奖 3
      await this.app.mysql.query('update clshop_sn set state = ? where product_id = ?',[1, this._result[0].product_id]);
      // 查询uid对应的用户名字 mobile
      let result_user = await this.app.mysql.query("select nickname, mobile from clshop_user where uid = ?",[this._result[0].uid])
      // 存入开奖表 （用户）
      const b = {
        title: this._result[0].product,
        upfile: product_ID[d].upfile,
        price: this._result[0].price,
        nickname: result_user[0].nickname,
        mobile: result_user[0].mobile,
        uid: this._result[0].uid,
        product_id:  this._result[0].product_id,
			  winner_end_time:  Date.now() + 1000 * 60,  // 生成开奖时间
			  state: 1, // 开奖状态
			  yun_code: Math.round(Math.random() * 65421), // 云
        good_code: this.app.createRandomId(), // 幸运码
        gonumber: this.app.setRnd(), // 次数
        end_time: new Date().toLocaleString() // 结束时间
      }
      await this.app.mysql.insert("clshop_winners_user", b)
    }
    for (let n = 0; n < winner_uid.length; n++) {
      const element = winner_uid[n];
      // 将订单的state改为 1 (已经开奖未中奖) 0 (未开奖)  3(中奖)
      await this.app.mysql.query('update clshop_sn set state = 3 where uid = ? and product_id = ?',[element, winner_product_id[n]]);
    }
      console.log('开奖完成');
  }
  // 机器人开奖自动投递
  async lotteryNPCAdd() {
    // 判断系统开奖设置表是否为机器人开奖
    let draw = await this.app.mysql.query('select state from clshop_draw_set');
    if (draw[0].state === 2) {
      // 随机出相应5个商品
      let result = await this.app.mysql.query("SELECT product_id, yicanyu FROM clshop_product WHERE status=0 and product_id >= (SELECT floor(RAND() * (SELECT MAX(product_id) FROM clshop_product))) ORDER BY product_id LIMIT 5");
      // 每个商品随机参与人数
      for (let i = 0; i < result.length; i++) {
        const element = result[i];
        // 插入商品中
        let results = await this.app.mysql.query('update clshop_product set yicanyu = ? where product_id = ?', [element.yicanyu + Math.floor(Math.random() * 10), element.product_id]);
      }
      return
    }

  }
  // 机器人开奖
  async lotterySetNPC(product_ID) {
    // 在机器人表中随机出
    let result = await this.app.mysql.query("SELECT * FROM clshop_lottery_npc LIMIT ?", [product_ID.length]);
    // 在商品表中查询对应商品信息写入表
    for (let i = 0; i < product_ID.length; i++) {
      const element = product_ID[i];
      let result_product_info = await this.app.mysql.query("SELECT upfile, title, price FROM clshop_product where product_id = ?", [element.product_id]);  
      // 组合
      const b = {
        title: result_product_info[0].title,
        upfile: result_product_info[0].upfile,
        price: result_product_info[0].price,
        username: result[i].username,
        mobile: result[i].mobile,
        username: result[i].username,
        state: 1, // 开奖状态
        yun_code: Math.round(Math.random() * 65421), // 云
        good_code: this.app.createRandomId(), // 幸运码
        gonumber: this.app.setRnd(), // 次数
        winner_end_time: Date.now() + 1000 * 60 * 1,
        end_time: new Date().toLocaleString() // 结束时间
      }
      // 写入机器人中奖表中
      await this.app.mysql.insert("clshop_winners", b)
      // 修改订单状态为已经开奖
      await this.app.mysql.query('update clshop_sn set state = 1 where state = ? and product_id = ?', [0, element.product_id]);
    }
    console.log('机器人开将完成');
    return
  }
}

module.exports = LotteryService;
