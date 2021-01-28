const rds = require('redis')
const log = require('./log')

/**
 * redis 封装自npm的redis包
 * 具体文档参考：https://www.npmjs.com/package/redis
 */
module.exports = class redis {
    static client = null

    static init() {
        if (this.client === null) {
            const cfg = global.env.redis
            this.client = rds.createClient(cfg.port, cfg.host, {
                auth_pass: cfg.password
            })
            this.client.on('ready', res => {
                log.info('redis 已启动！')
            })
            this.client.on('error', err => {
                log.error('redis error' + JSON.stringify(err))
            })
        }

        return this
    }

    static exec(method, params) {
        const client = this.client
        return new Promise((resolve, reject) => {
            client[method](...params, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    }
}