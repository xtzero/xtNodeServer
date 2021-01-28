const bizError = require('../../lib/exceptions/bizError')
/**
 * 格式化数值方法
 */
const initFuntions = {
    string(value) {
        return `${value}`
    },
    int(value) {
        return value - 0
    },
    bool(value) {
        return value ? true : false
    }
}

const formatFunctions = {
    jsonToObject(value) {
        return JSON.parse(value)
    }
}

/**
 * 参数验证中间件
 * xt 2020年12月15日
 */
module.exports = class checkParamMiddleware extends require('../../lib/base/baseMiddleware') {

    /**
     * 中间件执行逻辑
     * @param {controller} controller 
     * @param {function} action 
     */
    handle(controller, action) {

        // 从全局请求对象获取本次请求的参数
        let params = global.request.query
        if (Object.keys(params).length == 0) {
            params = global.request.body
        }

        // 初始化控制器参数列表：空对象
        controller.params = {}
        // 获取控制器里保存的参数配合
        const filter = controller.paramsFilter[action]
        // 如果没有参数配置，那就不处理
        if (filter === undefined) {
            return;
        }

        // 需要但是没有值的key列表，用于最后报错
        const needButNone = []

        // 循环配置项，按照配置将请求中的数据处理成控制器可用的参数列表
        Object.keys(filter).forEach(key => {
            // 当前键对应的配置
            const settings = filter[key]


            /**
             * 根据「是否传值」和「是否必要」，可以分为以下几种情况：
             * 
             * 给了                 按type格式化，没给type就来啥是啥
             * 没给
             *      必要            加入needButNone 
             *      非必要
             *          有默认值     给默认值
             *          没默认值     就不给了
             */

            // 值默认是undefined
            let value = undefined

            // 传值了
            if (params[key] !== undefined) {
                value = params[key]
                // 并且也给定格式了
                if (settings.type !== undefined) {
                    if (Object.keys(initFuntions).includes(settings.type)) {
                        // 那就按给定的格式进行格式化
                        value = initFuntions[settings.type](value)
                    }
                }
            }
            // 没传值
            else {
                // 如果必要，则记录进数组
                if (settings.require === true) {
                    needButNone.push(key)
                }
                // 如果非必要，并给定默认值，则取默认值
                else {
                    if (settings.default !== undefined) {
                        value = settings.default
                    }
                }
                // 如果非必要，也没传值，那就保持undefined
            }
            // 如果有「需要但没给」的字段，就报错
            if (needButNone.length > 0) {
                throw new bizError(`缺少必要参数：${needButNone.join(',')}!`)
            }

            // 程序到这里，value该有值就有值了，没值就是undefined
            // 如果有值，还有格式化配置，则处理格式化
            if (value !== undefined) {
                if (settings.format !== undefined && Object.keys(formatFunctions).includes(settings.format)) {
                    value = formatFunctions[settings.format](value)
                }
                // 处理完加入控制器参数列表
                controller.params[key] = value
            }
            // 如果连值都没有，那就不加入控制器参数列表了
        })

        return controller
    }
}