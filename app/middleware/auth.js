/**
 * 验证每次操作是否携带 token 
 * 
 */
const jwt = require('jsonwebtoken');

module.exports = (options, app) => {
	return async function userAuth(ctx, next) {
		// 排除不需要验证 token 的路由
		// if (ctx.request.url.indexOf(options.allowed) > -1) return await next(options);
		for (let i = 0; i < options.allowed.length; i++) {
			const element = options.allowed[i];
			// console.log(element);
			if (ctx.request.url.indexOf(element) > -1) {
				return await next(options);
			}
		}

		// 获取头部信息中的 token
		let { token } = ctx.header // 获取header里的username、token.
		// 如果没有 token 则判断为 未登录
		if (!token) {
			// 判断没有token是否为 '/' 
			if (ctx.request.url === '/') {
				await next(options);
				return
			}
			// 未登录
			ctx.status = 401;
			ctx.body = {
				msg: "未登录",
				code: 401
			}
			return
		}

		try {
			// 解密 token 获取其中的 mobile
			let result = verifyToken(token);
			let { mobile } = result

			// 获取redis的中该用户信息是否存在
			let RedisToken = await ctx.service.cache.get(String(mobile));
			// 提取 token 对比验证
			if (RedisToken !== String(token)) {
				// 匹配不正确
				ctx.status = 403;
				ctx.body = {
					msg: "用户失效",
					code: -1
				}
				return
			}
			await next(options);
		} catch (error) {  // 当解密失败 错误处理
			console.log(error);
			ctx.status = 500;
			ctx.body = {
				msg: "服务器错误，请联系管理员",
				code: -1,
			}
		}
	}
}

// 验证token的方法，传入token，解密，验证是否过期
function verifyToken(token) {
	let res = ''
	try {
		let result = jwt.verify(token, 'SDF@#$234WE$') || {};
		let { exp, iat } = result, current = Math.floor(Date.now() / 1000);
		if (current <= exp) {
			res = result.data || {};
		}
	} catch (e) {
		console.log(e);
	}
	return res;
}