const log = require('../log')
const response = require('../response')

module.exports = class bizError {
    constructor(msg, e) {
        log.error(e)
        response.ajax(msg, 500)
    }
}