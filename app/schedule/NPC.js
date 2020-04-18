module.exports = {
    schedule: {
        interval: '5m', // 时间间隔
        type: 'all', // 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        // 启动自动投递
        // await ctx.service.lottery.lotteryNPCAdd()
    },
};