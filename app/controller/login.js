const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken'); // 生成token的插件模块


class AdminController extends Controller {
  // 用户登录
  async login() {
      let { ctx } = this;
      // 获取参数
      let { mobile,  password} = this.ctx.query;
      // 数据校验
      if (!mobile) { 
        ctx.body = { msg: '参数不完整', code: 201 }
        return 
      };
      // 调用服务查询是否存在此用户
      let loginResult = await this.service.login.login(mobile, password);
      // 表示登录成功
      if(loginResult.code === 0){
      // token过期时间 这里的时间是以秒来计算
      let time = 259200; // 3d
      // 生成token，generateToken是一个自定义的函数 传入 对象
      let token = generateToken({ mobile: mobile}, time);
      // 把token存入redis
      this.service.cache.set(mobile, token, time) ;
      // 返回的信息
      ctx.body = {
          code: 0,
          msg: '登录成功',
          token: token
      }
    } else {
      if (loginResult.code === 2) {
        // 暂未注册
        ctx.body = {
            code: 202,
            msg: '该用户尚未注册'
        }
      } else {
        // 登录失败处理
        ctx.body = {
          code: -1,
          msg: '登录失败'
        }
      }
    }
  }
  // 注册操作
  async register(){
    const { ctx } = this;
    // 获取参数
    const { mobile, password, code } = this.ctx.query;
    // 校验数据合法性
    const myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
    if (myreg.test(mobile) && password && code) {
        // 校验验证码 
        console.log(Number(code), await this.service.cache.get(`${mobile}_code`))
        if (Number(code) !== await this.service.cache.get(`${mobile}_code`)) {
          // 验证码错误
          ctx.body = {
            code: 4,
            msg: '验证码错误或过期'
          }
          return
        }
        // 密码 进行加密处理
        const ciphertext = this.app.Encrypt(password)
        // 调用服务该手机是否存在数据库，存在则注册过了
        let resMobile = await this.service.login.GetMobile(mobile)
        // 2 为注册过 0 未注册
        if (resMobile.code === 2) {
          // 已经注册过
          ctx.body = {
            code: 203,
            msg: '该手机已经注册'
          }
          return
        }
        // 调用服务存入数据库
        let res = await this.service.login.register(mobile, ciphertext)
        if (res.code === 0) {
          // 数据库插入成功
          // 清除redis验证码
          await this.service.cache.set(`${mobile}_code`, '', 1)
          ctx.body = {
            code: 200,
            msg: '注册成功'
          }
        } else {
          // 数据库插入失败
          ctx.body = {
            code: -1,
            msg: '注册失败'
          }
        }
    } else {
      // 参数不完整处理
      ctx.body = {
        code: 201,
        msg: '参数不完整或手机号码格式错误'
      }
    }
  }
  // 注销操作
  async loginOut(){
    // 注销redis中的数据
    // 判断是否携带 token
    const { token } = this.ctx.query;
    // 存在 token
    // token 解密
    let res = verifyToken(token);
    // 解密出 token 中用户名，再去redis中找是否存在对应信息
    let { mobile } = res;

    if (token !== undefined) {
      // 去redis查询是否存在该 key
      const RedisToken = await this.service.cache.get(mobile)
      if ( RedisToken === null) {
        // redis暂无
        this.ctx.body = {
          code: -1,
          msg: '暂未查询此用户信息'
        }
      } else {
        // 清除redis中对应的key的内容
        this.ctx.body = {
          code: 200,
          msg: `${mobile} 用户注销成功`
        }
      }
    } else {
      // 不存在mobile 错误处理
      this.ctx.body = {
        code: 201,
        msg: '参数错误'
      }
    }
  }
  // 获取用户信息
  async loginInfo(){
    // 获取参数
    const { token } = this.ctx.query;
    // 校验参数
    if (token) {
      // 剥离出 mobile
      const mobile = verifyToken(token);
      // 调用服务查询
      let db_res = await this.service.login.loginInfo(mobile.mobile)
      if (db_res.code === 0) {
        this.ctx.body = {
          code: 200,
          msg: 'success',
          data: db_res.res
        }
        return
      }
      this.ctx.status = 401;
      this.ctx.body = {
        code: 401,
        msg: '非法token'
      }
    } else {
      this.ctx.body = {
        code: 201,
        msg: '参数不完整'
      }
    }
  }
  // 忘记密码
	async forGetPass(){
		// 获取参数
    const { mobile, pass, code } = this.ctx.query;
    // 校验参数
		if (mobile!== null || pass!== null || code !== null) {
			// 调用服务处理
			let res = await this.service.login.forgetPass(mobile, pass, code)
			switch (res.code) {
				case 0:
					this.ctx.body = {
						code: 200,
						msg: '修改密码成功'
					}
					break;
				case 4:
					this.ctx.body = {
						code: 4,
						msg: '验证码错误或过期'
					}
					break;
				case -1:
					this.ctx.status = 500;
					this.ctx.body = {
						code: -1,
						msg: '服务器错误'
					}
					break;
			
				default:
					break;
			}
			return
		}
		this.ctx.body = {
			code: 201,
			msg: '参数不完整'
		}
	}
}

// 自定义的生成token的函数
function  generateToken(data, time){
  let created = Math.floor(Date.now() / 1000);
    let token = jwt.sign({
        data,
        exp: created + time
    }, 'SDF@#$234WE$');
    return token;
}


// 验证token的方法，传入token，解密，验证是否过期
function verifyToken(token) {
    let res = ''
    try {
        let result = jwt.verify(token, 'SDF@#$234WE$') || {};
        let {exp, iat} = result, current = Math.floor(Date.now() / 1000);
        if (current <= exp) {
            res = result.data || {};
        }
    } catch (e) {
        console.log(e);
    }
    return res;
}




module.exports = AdminController;