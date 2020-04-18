'use strict'

/** @type Egg.EggPlugin */
module.exports = {
  // egg-mysql 
  mysql: {
    enable: true,
    package: 'egg-mysql'
  },
  // egg-redis 
  redis: {
    enable: true,
    package: 'egg-redis'
  },
  // 跨域
  cors: {
    enable: true,
    package: 'egg-cors'
  }
}
