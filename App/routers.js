const { static } = require('express')
const router = require('../lib/router')

module.exports = class routers {
    static init(appInst) {
        const r = new router(appInst)

        r.get('', 'index/indexController@index')
        r.group('user', (r) => {
            r.get('register7', 'index/indexController@index')  
        })
    }
}