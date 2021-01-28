module.exports = {
    /**
     * 默认的模块名
     */
    defaultModule: 'index',
    /**
     * 默认的控制器名
     */
    defaultController: 'index',
    /**
     * 默认的方法名
     */
    defaultFunction: 'index',

    /**
     * 当前项目的绝对路径
     * 以及几个特别的路径
     */
    rootPath: process.cwd(),
    appPath: process.cwd() + '/app',
    runtimePath: process.cwd() + '/runtime',
    logPath: process.cwd() + '/runtime/log'
}