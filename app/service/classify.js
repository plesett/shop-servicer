'use strict';

const Service = require('egg').Service;

class ClassifyService extends Service {
  async classifyMenu(classify_code) {
      try {
        // 查询
        let result = await this.app.mysql.select("clshop_product",{
          where:{ 
            classify: classify_code,
            status: 0
          }
        })
        return { code: 0, res: result }
      } catch (error) {
          return { code: -1 }
      }
  }
  // 揭晓 全部
  async unveiled(){
    try {
       let results = await this.app.mysql.query('select * from clshop_product where status=0 order by yicanyu desc');
       return { code: 0, res: results }
    } catch (error) {
      return { code: -1 }
    }
  }
  // 分类 揭晓
  async unveiled_classify(classify_code){
    try {
       let results = await this.app.mysql.query(`select * from clshop_product where classify=${Number(classify_code)} and status=0 order by yicanyu desc`);
       return { code: 0, res: results }
    } catch (error) {
      return { code: -1 }
    }
  }
  // 人气 全部
  async moods() {
    try {
      let results = await this.app.mysql.query(`select * from clshop_product where status=0 order by zongcanyu desc`);
      return { code: 0, res: results }
    } catch (error) {
      return { code: -1 }
    }
  }
  // 人气 分类
  async moods_classify(classify_code) {
    try {
      let results = await this.app.mysql.query(`select * from clshop_product where classify=${Number(classify_code)} and status=0 order by zongcanyu desc`);
      return { code: 0, res: results }
    } catch (error) {
      return { code: -1 }
    }
  }
  // 最新
  async new_classify(classify_code) {
    try {
      if (classify_code !== undefined) {
        // 存在查询分类商品中倒序
        let results = await this.app.mysql.query(`select * from clshop_product where classify=${Number(classify_code)} and status=0 order by product_id desc`);  
        return { code: 0, res: results }
      }
      if (classify_code === undefined) {
        // 查询全部商品倒序
        let results = await this.app.mysql.query(`select * from clshop_product where status=0 order by product_id desc`);
        return { code: 0, res: results }
      }
    } catch (error) {
      return { code: -1 }
    }
  }
  // 价格
  async price(classify_code, type) {
    // 判断请求是全部还是分类的价格
    if (classify_code&&type) {
      // 分类
      try {
        let results = await this.app.mysql.query(`select * from clshop_product where classify=${Number(classify_code)} and status=0 order by price ${type}`);
        return { code: 0, res: results }
      } catch (error) {
        return { code: -1 }
      }
    } 
    else if (type) {
      // 全部
      try {
        let results = await this.app.mysql.query(`select * from clshop_product where status=0 order by price ${type}`);
        return { code: 0, res: results }
      } catch (error) {
        return { code: -1 }
      }
    } else {
      return { code: -1 }
    }
  }
}

module.exports = ClassifyService;
