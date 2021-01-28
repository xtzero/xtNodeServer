const bizError = require('../lib/exceptions/bizError')
const bootstrap = require('./bootstrap')

module.exports = class router {
    app = null
    routerPrefix = ''

    constructor(app) {
        this.app = app
    }

    group(groupName, callback) {
        this.routerPrefix = groupName
        callback(this)
        this.routerPrefix = ''
    }

    get(path, action) {
        this.add('get', path, action)
    }

    post(path, action) {
        this.add('post', path, action)
    }

    add(method, path, action) {
        const _path = '/' + [this.routerPrefix, path].join('/')
        const actions = this.processAction(action)
        try {
            this.app[method](_path, (req, res) => {
                bootstrap.bootstrap(
                    require(`../App/controllers/${actions.module}/${actions.controller}.js`),
                    actions.function,
                    {
                        req: req,
                        res: res
                    }
                )
            })
        } catch (e) {
            throw new bizError(e)
        }
        
    }

    /**
     * 把路由配置里的字符串拆分成模块、控制器、方法
     * @param {*} action 
     */
    processAction(action) {
        return {
            module: action.split('@')[0].split('/')[0] || global.config.defaultModule,
            controller: action.split('@')[0].split('/')[1] || global.config.defaultController,
            function: action.split('@')[1] || global.config.defaultFunction
        }
    }
}