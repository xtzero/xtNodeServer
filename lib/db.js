const mysql = require('mysql')
const bizError = require("./exceptions/bizError")

module.exports = class db {
    static inst = null

    static init() {
        const config = global.env.mysql
        if (this.inst == null) {
            this.connect(config)
        }
        return this.inst
    }

    static connect(conf) {
        conf.multipleStatements = true
        try {
            const conn = mysql.createConnection(conf)
            conn.connect()
            this.inst = conn
        } catch (e) {
            throw new bizError('数据库连接失败', e)
        }
    }

    /**
     * 执行sql
     * @param {string} sql 
     */
    static query(sql) {
        return new Promise((resolve, reject) => {
            db.inst.query(sql, (error, results, fields) => {
                if (error) {
                    const err = ['mysql error', error]
                    reject(err)
                    throw new bizError(...err)
                }
                resolve(results)
            })
        })
    }
}