const middleware = require("./middleware");

module.exports = class bootstrap {
    /**
     * 定义运行行为
     * @param {controller} controller 
     * @param {function} action 
     * @param {object} options 
     */
    static bootstrap(controller, action, options) {
        // 当前的请求和返回对象都放到全局
        global.request = options.req;
        global.response = options.res;
        global.controller = controller;

        // 实例化控制器对象
        const controllerInst = new controller(options.req, options.res)

        // 使用中间件处理
        middleware.processBeforeMiddlewares(controllerInst, action)

        // 运行
        controllerInst[action]()
    }
}