const express = require('express')
const appInst = express()
const s = require('../lib/server')
const routers = require('../App/routers')
const bizError = require('./exceptions/bizError')
const db = require('../lib/db')
const log = require('./log')
const rds = require('../lib/redis')
const redis = require('../lib/redis')

global.env = require('../env')
global.config = require('../lib/config')
global.mysql = db.init()
global.rds = rds.init()

module.exports = class app {
    static async run() {
        const r = routers.init(appInst)
        const server = new s(appInst)

        log.info("应用启动！")

        appInst.on('error', (e) => {
            throw new bizError('失误了')
        })
    }
}