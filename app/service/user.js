'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  async update(nickname, sex,uid, upfile) {
    // 插入数据库
    await this.app.mysql.query('update clshop_user set nickname = ?, sex = ?, upfile = ?  where uid = ?',[ nickname, sex, upfile ? upfile : '/public/default_yg.png', uid]);
    return { code: 0 }
  }
  async updatePass(formerPass, newPass, uid) {
    // 首先验证原密码是否正确
    let result = await this.app.mysql.select("clshop_user",{
        where:{ uid: uid}
    })
    // 解密后密码
    const db_pass = this.app.Decrypt(result[0].password);
    if (db_pass === formerPass) {
        try {
            await this.app.mysql.query('update clshop_user set password = ?  where uid = ?',[this.app.Encrypt(newPass), uid]);
            let resMobile = await this.app.mysql.query('select mobile from clshop_user where uid = ?',[uid]);
            return { code: 0 ,mobile: resMobile[0].mobile}
        } catch (error) {
            return {
                code: -1,
                error: error
            } 
        }
    } else {
        return {
            code: 5
        }
    }
  }
  async shops(uid) {
		let result = await this.app.mysql.query(`select title,upfile,end_time,mobile,nickname from clshop_winners_user where uid=${Number(uid)} and state=1`);
		return { code: 0 ,res: result}
  }
  async record(uid) {
		let result = await this.app.mysql.query(`select title,upfile,end_time,mobile,nickname,state from clshop_winners_user where uid=${Number(uid)}`);
		// 获得未开奖的商品 id
        let result_ing = await this.app.mysql.query(`select * from clshop_sn where uid=${Number(uid)}`);
		// 查询商品的信息
		
		return { code: 0 ,res: result, sn: result_ing}
  }
  async UserList(){
    const res = await this.app.mysql.query('select uid, upfile, nickname, mobile, balance, username, state, login_time from clshop_user');
    return { code: 0, res: res }
  }
  async UserDelete(uid) {
      let res = await this.app.mysql.delete('clshop_user',{ uid: Number(uid) });
      return { code: 0 }
  }
  async UserInfo(uid) {
      const res = await this.app.mysql.query('select uid, nickname, balance, username, state from clshop_user where uid = ?', [uid])
      return { code: 0, res: res[0]}
  }
  async UserUpdata(value) {
      	try {
			const data = eval("("+value+")");
			// 更新数据库
			await this.app.mysql.query(
				'update clshop_user set nickname = ?, balance = ?, username = ?, state = ? where uid = ?',
				[
					data.nickname, 
					data.balance,
					data.username,
					data.state,
					data.uid
				]
            );
			return { code: 0 }
		} catch (error) {
			return { code: -1 }
		}
  }
}

module.exports = UserService;
