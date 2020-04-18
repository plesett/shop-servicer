'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  // 更新用户信息
  async update() {
		// 获取参数
		const { nickname, sex, uid, upfile } = this.ctx.query;
		// 校验参数, upfile可有可无
		if (nickname || sex || uid !== null) {
			// 调用服务
			let res = await this.service.user.update(nickname, sex, uid, upfile)
			if (res.code === 0) {
				this.ctx.body = {
					code: 0,
					msg: '更新成功'
				}
				return
			}
			this.ctx.status = 500;
			this.ctx.body = {
				msg: '错误'
			}
		} else {
			this.ctx.status = 204;
			this.ctx.body = {
				code: 201,
				msg: '参数不完整'
			}
		}
	}
	// 更新用户密码
	async updatePass() {
		// 获取参数
		const { formerPass, newPass, uid } = this.ctx.query;
		// 校验参数
		if (formerPass && newPass && uid !== undefined) {
			// 调用服务
			let res = await this.service.user.updatePass(formerPass, newPass, uid)
			switch (res.code) {
				case 0:
					// 清除该用户 token
					this.service.cache.set(res.mobile, '', 1)
					this.ctx.body = {
						code: 200,
						msg: '密码已成功修改'
					}
					break;
				case 5:
					this.ctx.body = {
						code: 405,
						msg: '原密码错误'
					}
				break;
				case -1:
					this.ctx.status = 500;
					this.ctx.body = {
						msg: '错误，请联系管理员处理'
					}
				break;
				default:
					break;
			}
		} else {
			this.ctx.body = {
				code: 201,
				msg: '参数不完整'
			}
		}
	}
	// 用户获得所有的商品记录
	async record() {
		const { uid } = this.ctx.query;
		if (uid) {
			let res = await this.service.user.record(uid);
			switch (res.code) {
				case 0:
					this.ctx.body={
						code: 200,
						msg: 'success',
						data: res.res,
						sn: res.sn
					}
					break;
			
				default:
					this.ctx.body={
						msg: 'ok'
					}
					break;
			}
		} else {
			this.ctx.body = {
				code: 201,
				msg: '参数不完整'
			}
		}
	}
	// 用户获得的商品
	async shops() {
		const { uid } = this.ctx.query;
		if (uid) {
			let res = await this.service.user.shops(uid);
			switch (res.code) {
				case 0:
					this.ctx.body={
						code: 200,
						msg: 'success',
						data: res.res
					}
					break;
			
				default:
					this.ctx.body={
						msg: 'ok'
					}
					break;
			}
		} else {
			this.ctx.body = {
				code: 201,
				msg: '参数不完整'
			}
		}
	}
	// 获取用户列表
	async UserList() {
		const res = await this.service.user.UserList()
		if (res.code === 0) {
			this.ctx.body = {
				code: 200,
				msg: 'success',
				data: res.res
			}	
			return
		}
		this.ctx.body = {
			code: -1,
			msg: '查询失败',
		}
	}
	// 删除用户
	async UserDelete() {
		const { uid } = this.ctx.query;
		console.log(uid);
		if (uid) {
			const res = await this.service.user.UserDelete(uid);
			if (res.code === 0) {
				this.ctx.body = {
					code: 200,
					msg: '删除成功'
				}
				return
			}
			this.ctx.status = 5000;
			this.ctx.body = {
				msg: '服务器错误'
			}
		} else {
			this.ctx.body = {
				msg: '错误'
			}
		}
	}
	// 单个用户信息
	async UserInfo() {
		const { uid } = this.ctx.query;
		const res = await this.service.user.UserInfo(uid);
		if (res.code === 0) {
			this.ctx.body = {
				code: 200,
				msg: 'success',
				data: res.res
			}
			return
		}
		this.ctx.body = {
			code: -1,
			msg: '查询不到用户',
		}
	}
	// 编辑用户
	async UserUpdata() {
		/**
		 * 用户名称:用户余额:用户等级:用户状态:
		 * 
		 */
		const { value } = this.ctx.query;
		const res = await this.service.user.UserUpdata(value);
		switch (res.code) {
      case 0:
        this.ctx.body = {
          code: 200,
          msg: '更新成功'
        }
        break;

      case -1:
        this.ctx.status = 403;
        this.ctx.body = {
          code: -1,
          msg: '更新失败'
        }
        break;
    
      default:
        this.ctx.status = 500;
        this.ctx.body = {
          msg: '服务器错误'
        }
        break;
		}
	}
}

module.exports = UserController;
