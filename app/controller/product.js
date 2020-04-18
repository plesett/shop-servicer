'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');
const createHash = require('hash-generator');


class ProductController extends Controller {
  // 获取商品信息
  async info() {
    const { ctx } = this;
    // 接收参数 @parma{ per_page 数量 &page 页数 } GET
    const { per_page, page } = this.ctx.query;
    // 判断是否携带get参数
    if (!page) {
        ctx.body = {
            code: 200,
            msg: "未携带参数"
        }
        return
    }
    // 异常捕获
    try {
        // 查询数据库
        // await this.app.mysql.insert("clshop_product",{title:"中国黄金 财富投资金条Au9999 50g",upfile:"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1582024045336&di=1cb86d0c784d4d569ed52c5fc41c6b35&imgtype=0&src=http%3A%2F%2Fp3.so.qhimgs1.com%2Ft0160e1ff8275e7e0e3.jpg", price: 354.00,status: 0})
        let result = await this.app.mysql.query(`select * from clshop_product limit ${ page },${ per_page === undefined ? 11 : per_page }`);
        ctx.body = {
            code: 200,
            msg: 'success',
            data: result
        }
    } catch (error) {
        ctx.status = 403
        ctx.body = {
            code: -1,
            msg: "暂未查询到数据"
        }
    }
  }
  // 商品详情 中奖者信息
  async details() {
    // 获取参数
    const { product_id } = this.ctx.query;
    if (product_id !== undefined) {
      // 调用服务
      const db_res = await this.service.product.detail(product_id, null);
      // 判断redis是否存在数据
      const redis_winner = await this.service.cache.get(`details_winner_${product_id}`)
      // 不存在
      if (redis_winner === null) {
        // 拿出商品中奖者数据存入redis, 5分钟更新
        await this.service.cache.set(`details_winner_${product_id}`, db_res.winners, 300) 
        if (db_res.code === 0) {
          this.ctx.body = {
            code: 200,
            msg: 'success',
            data: {
              winners: db_res.winners,
              info: db_res.res[0],
            } 
          }
        } else {
          this.ctx.status = 403
          this.ctx.body = {
            msg: '非法参数'
          }
        }
      } else {
          this.ctx.body = {
            code: 200,
            msg: 'success',
            data: {
              winners: redis_winner,
              info: db_res.res[0],
            } 
          }
      }
    } else {
      this.ctx.status = 400;
      this.ctx.body = {
        code: 201,
        msg: '参数不完整'
      }
    }
  }
  // 单个商品信息
  async single() {
    const { product_id } = this.ctx.query;
    if (product_id) {
      const res = await this.service.product.detail(product_id, 'single')
      if (res.code === 0) {
        this.ctx.body = {
          code: 200,
          msg: 'success',
          data: res.res[0]
        }
      }
    } else {
      this.ctx.body = {
        msg: '参数不完整'
      }
    }
  }
  // 新增商品
  async create() {
    const { value } = this.ctx.query;
    const data = eval("("+value+")");
    let res = await this.service.product.create(data)
    switch (res.code) {
      case 0:
        this.ctx.body = {
          code: 200,
          msg: '新增成功'
        }
        break;
      case -1:
        this.ctx.body = {
          code: -1,
          msg: '新增失败'
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
  // 更新商品
  async update() {
    const { value } = this.ctx.query;
    let res = await this.service.product.update(value)
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
          msg: '插入失败'
        }
        break;
    
      default:
        this.ctx.status = 500;
        this.ctx.body = {
          code: -1,
          msg: '服务器错误'
        }
        break;
    }
  }
  // 删除商品
  async delete() {
    const { product_id } = this.ctx.query;
    if (product_id) {
      let res = await this.service.product.delete(Number(product_id))
      switch (res.code) {
        case 0:
          this.ctx.body = {
            code: 200,
            msg: '删除成功'
          }
          break;
        case -1:
          this.ctx.status = 403;
          this.ctx.body = {
            code: -1,
            msg: '非法访问'
          }
          break;
      
        default:
          this.ctx.status = 500;
          this.ctx.body = {
            msg: '服务器错误哦'
          }
          break;
      }

    } else {
      this.ctx.body = {
        msg: '参数不完整'
      }
    }
  }
  // 生成七牛 token
  async upload() {
    var accessKey = 'lhpKyq6iCIndMjRyAUuuXXldSg6cHPrVxNEzzarn';
    var secretKey = 'b4mdd9kxyY3ioWSdzYnVBMYzrUR2OUywr7u1tmzj';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var options = {
      scope: 'wes',
      // persistentOps: 'F:/egg/egg-example/egg-example/app/controller/qini.txt',
      // persistentPipeline: "video-pipe",
      returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken=putPolicy.uploadToken(mac);
    var hash = createHash(0);

    this.ctx.body = {
      token: uploadToken,
      hash: hash
    }
	}
}

/**
 *  title,
    upfile,
    price,
    status,
    zongcanyu,
    yicanyu,
    classif
 */

module.exports = ProductController;
