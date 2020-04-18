/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1581819462180_2016';

  // add your middleware config here
  config.middleware = ['auth'];
  config.auth = {
      allowed: [
        '/public',
        '/login',
        '/register',
        '/test',
        '/notice',
        '/lottery',
        '/product_list',
        '/product_details',
        '/classify_menu',
        '/classify_unveiled',
        '/classify_moods',
        '/classify_price',
        '/classify_new',
        '/sms',
        '/forgetPass',
        // ----
        '/user/pay',
        '/pay/notify',
        // 以下接口需要后台登录
        '/get/product',
        '/delete/product',
        '/update/product',
        '/upload',
        '/create/product',
        '/get/user',
        '/delete/user',
        '/user/info/update',
        '/user/info',
        '/get/order',
        '/get/order/npc',
        '/get/setting',
        '/get/order/pay'
      ]
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

    config.jwt = {
      secret: 'ASE1!&*',
      expiresIn: 60*60*2 // 2小时过期
    }

    // mysql连接信息
    config.mysql={
      //database configuration 
      client:{
          //host 
          host:'127.0.0.1',
          //port 
          port:'3306',
          //username 
          user:'root',
          //password 
          password:'zkpk!123',
          //database 
          database:'db_test'
      },
      //load into app,default is open //加载到应用程序，默认为打开
      app:true,
      //load into agent,default is close //加载到代理中，默认值为“关闭”
      agent:false,
  };

  // redis 连接信息
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '',
      db: 0,
    },
  }
  // 关闭 安全威胁csrf的防范
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // 跨域配置
  config.cors = {
    origin: '*',//匹配规则  域名+端口  *则为全匹配
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  return {
    ...config,
    ...userConfig,
  };
};