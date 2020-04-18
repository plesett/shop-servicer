const fs = require("fs");
const path = require("path");
const AlipaySDK = require("alipay-sdk").default;
const AlipayFormData = require("alipay-sdk/lib/form").default;
const Controller = require("egg").Controller;

class AlipayController extends Controller {
  async index() {
    const { ctx } = this;
    const { uid, type, money } = ctx.query; 
    const alipaySdk = new AlipaySDK({
      appId: "2016102000727785", // 你自己的沙箱黄环境的appId
      privateKey: fs.readFileSync(
        path.join(__dirname, "../../config/pem/private_key.pem"),
        "ascii"
      ), // 私钥
      signType: "RSA2", // 签名类型
      
      alipayPublicKey: fs.readFileSync(
        path.join(__dirname, "../../config/pem/alipay_public_key.pem"),
        "ascii"
      ), // 支付宝公钥（不是应用公钥）
      gateway: "https://openapi.alipaydev.com/gateway.do", // 网关地址
      timeout: 5000, // 网关超时时间
      camelcase: true // 是否把网关返回的下划线 key 转换为驼峰写法
    });
    /**
     * 返回支付链接（PC支付接口）
     */
    const code_sn = this.app.createRandomId();
    const formData = new AlipayFormData();
    formData.setMethod("get");
    formData.addField("appId", "2016102000727785");
    formData.addField("charset", "utf-8");
    formData.addField("signType", "RSA2"); 
    formData.addField('notifyUrl', 'http://47.101.206.144:7001/pay/notify'); // 支付成功异步通知地址   一定是外网能访问
    formData.addField('returnUrl', 'http://192.168.31.23:8000/user/'); // 支付成功回调地址
    // formData.addField("timestamp", dayjs().format("YYYY-MM-DD HH:mm:ss"));
    formData.addField("bizContent", {
      outTradeNo: code_sn,// 【必选】商户订单号：64个字符内，包含数字，字母，下划线；需要保证在商户端不重复
      productCode: "FAST_INSTANT_TRADE_PAY",// 【必选】销售产品码，目前仅支持FAST_INSTANT_TRADE_PAY
      totalAmount: money,// 【必选】订单总金额，精确到小数点后两位
      timeout_express: "15m", // 【必选】 该笔订单允许的最晚付款时间，逾期将关闭交易。
      subject: `虚拟金币充值 ${money} 元`,// 【必选】 订单标题
      body: uid, // 【可选】订单描述
      // quit_url: "http://127.0.0.1:8000" // 用户付款中途退出返回商户网站的地址
    });
    /**
     * exec对应参数：
     * method（调用支付宝api）
     * params（api请求的参数（包含“公共请求参数”和“业务参数”））
     * options（validateSign，formData，log）
     */
    
    // console.log(Number(type) === 1 ? "alipay.trade.wap.pay" : "alipay.trade.page.pay", type)
    const result = await alipaySdk.exec(
      Number(type) === 1 ? "alipay.trade.wap.pay" : "alipay.trade.page.pay",
      {},
      { formData }
    ); 
    // result为可以跳转到支付连接的url
    ctx.body = result
  }
  async notify() {
    const { body } = this.ctx.request;
    /**
     * 保存充值记录
     * gmt_create: 充值时间
     * subject: 充值项目
     * trade_no: 支付宝订单号
     * out_trade_no:商家订单号
     * invoice_amount:充值金额
     * trade_status:订单状态{
     * WAIT_BUYER_PAY	交易创建，等待买家付款
     * TRADE_CLOSED	未付款交易超时关闭，或支付完成后全额退款
     * TRADE_SUCCESS	交易支付成功
     * TRADE_FINISHED	交易结束，不可退款
     * }
     */
    const { 
      gmt_create, 
      subject, 
      trade_no, 
      out_trade_no, 
      invoice_amount,
      trade_status
    } = body;

    // 保存
    await this.app.mysql.insert("clshop_pay", {
      gmt_create: gmt_create,
      subject: subject,
      trade_no: trade_no,
      out_trade_no: out_trade_no,
      invoice_amount: invoice_amount,
      trade_status: trade_status,
      uid: body.body
    })
    // 查询用户
    let user_info = await this.app.mysql.query('select balance from clshop_user where uid = ?', [body.body])
    // 扣除该用户的 余额
    await this.app.mysql.query('update clshop_user set balance = ? where uid = ?', [Number(user_info[0].balance) + Number(invoice_amount), body.body]);

    switch (trade_status) {
      case 'WAIT_BUYER_PAY':
        this.ctx.body = "支付失败"  
        break;
      case 'TRADE_SUCCESS':
        this.ctx.body = "success"  
        break;
    
      default:
        this.ctx.body = "支付失败"
        break;
    }
  }
  async examine() {
    try {
      const { out_trade_no, trade_no } = this.ctx.query;
      await this.app.mysql.select("clshop_pay", {
        where: {
          out_trade_no: out_trade_no,
          trade_no: trade_no
        }
      })
      this.ctx.body = {
        code: 200,
        msg: '充值成功'
      }
    } catch (error) {
      this.ctx.status = 500;
      this.ctx.body = {
        code: -1
      }
    }
  }
}
 
module.exports = AlipayController;