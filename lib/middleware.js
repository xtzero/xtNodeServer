module.exports = class middleware {
    /**
     * 处理请求前中间件
     * @param {*} controller 
     */
    static processBeforeMiddlewares(controller, action) {
        const beforeMiddlewares = require('../App/middlewares/stack').beforeRequest
        beforeMiddlewares.forEach(middleware => {
            (new middleware()).handle(controller, action)
        })
    }
}