const baseController = require('../../../lib/base/baseController');
const mysqlBuilder = require('../../../lib/mysqlBuilder');
const response = require('../../../lib/response')

module.exports = class index extends baseController {
    paramsFilter = {
        index: {
            nickname: {type: 'string', require: true, default: '傑洛', desc: '昵称'},
            filter: {type: 'bool', format: 'json', desc: '昵称'},
        }
    }

    async index() {

        const dbRes = await (new mysqlBuilder()).beginTransaction(() => {
            const dbres1 = (new mysqlBuilder()).update('user')
                .data({nickname: '事务改名1'})
                .where({
                    id: 4
                }).query();
            const dbres2 = (new mysqlBuilder()).update('user')
                .data({weixin1: '事务改名2'})
                .where({
                    id: 4
                }).query();
                console.log(dbres1, dbres2)
        })
        // .then(res => {
        //     console.log('trans res', res)
        // })
        .catch(e => {
            console.log('trans e', e)
        })
            
        console.log('this.params', this.params)
        response.ajax(dbRes)
    }
}