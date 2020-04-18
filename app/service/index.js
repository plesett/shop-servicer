'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
  async index() {
    console.log(this.ctx.query);
    // 查询书库
      let result = await this.app.mysql.get("clshop_admin")

      // 第二种查询数据库 
      // let result1 = await this.app.mysql.select("user",{
      //   where:{id:3}
      // })
      // 插入数据库
      // await this.app.mysql.insert("user",{name:"lisi",title:"1234", test: "test111"})
      // 修改数据
      // await this.app.mysql.update('user',{ id:2, test:'赵四' });
      //修改数据的第二种方式：通过 sql 来修改数据
      // this.app.mysql.query(sql,values);
      // let results=await this.app.mysql.query('update user set username = ? where id = ?',["王五",2]);
    // 删除数据
      // await this.app.mysql.delete('user',{ id: 1 });


    
    return result?result:{msg: 'dd'};  
  }
}

module.exports = IndexService;
