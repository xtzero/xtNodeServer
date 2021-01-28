const checkParamMiddleware = require("./checkParamMiddleware");

module.exports = {
    /**
     * 请求前中间件数组
     */
    beforeRequest: [
        checkParamMiddleware
    ]
}