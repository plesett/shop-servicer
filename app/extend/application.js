const CryptoJS = require('crypto-js')
const key = CryptoJS.enc.Utf8.parse('9461090361BAPUEM'); // 十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412'); // 十六位十六进制数作为密钥偏移量

module.exports = {
  // crypto.js进行加密
  // 解密方法
  Decrypt(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word)
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
    return decryptedStr.toString()
  },
  // 加密方法
  Encrypt(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word)
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
    return encrypted.ciphertext.toString().toUpperCase()
  },
  // 生成唯一编码
  createRandomId() {
    return ((new Date()).getTime())
  },
  // 生成200内随机数
  setRnd() {
    return Math.floor(Math.random() * 147)
  },
  // 生成时间戳
  CountTime(t , b) {
    var time = new Date(t.replace('-', '/'))
    time.setMinutes(time.getMinutes() + b, time.getSeconds(), 0)
    var d = new Date(time)
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    m = m < 10 ? ('0' + m) : m
    var da = d.getDate()
    da = da < 10 ? ('0' + da) : da
    var h = d.getHours()
    h = h < 10 ? ('0' + h) : h
    var minute = d.getMinutes()
    minute = minute < 10 ? ('0' + minute) : minute
    var resDate = y + '-' + m + '-' + da + ' ' + h + ':' + minute
    return resDate
  },
  // 请求的返或判定
  ErrorCapture(data) {
    try {
      if (data.code === 0) {
        return {
          code: '200',
          msg: 'success',
          data: data.res
        }
      } else {
        return {
          code: 2,
          msg: '未查询到数据'
        }
      }
    } catch (error) {
      throw '不存在 data参数 或者 data 没有res对象'
    }
  }
}
