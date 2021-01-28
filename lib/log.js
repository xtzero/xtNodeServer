const fs = require('fs')
const bizError = require('./exceptions/bizError')
const utils = require('./utils')
module.exports = class log {
    static write(type, content) {
        let path = global.config.rootPath + '/runtime/logs/' + utils.formatDate('{Y}-{m}-{d}')
        fs.stat(path, (err, stats) => {
            if (err || !stats.isDirectory()) {
                fs.mkdir(path, { recursive: true }, err => {
                    if (err) {
                        throw new bizError('初始化日志文件失败', err)
                    } else {
                        path = global.config.rootPath + '/runtime/logs/' + utils.formatDate('{Y}-{m}-{d}') + '/' + type + '.log'
                        fs.open(path, 'a', (err, fd) => {
                            if (err) {
                                throw new bizError('创建日志文件错误', err)
                            } else {
                                const contentWillWrite = `${utils.formatDate('{Y}-{m}-{d} {H}:{i}:{s}')} ${type} : ${JSON.stringify(content)} \n`
                                fs.writeFile(fd, contentWillWrite, err => {
                                    if (err) {
                                        throw new bizError('写入日志文件失败', err)
                                    }
                                })
                            }
                        })
                    }
                })
            } else {
                path = global.config.rootPath + '/runtime/logs/' + utils.formatDate('{Y}-{m}-{d}') + '/' + type + '.log'
                fs.open(path, 'a', (err, fd) => {
                    if (err) {
                        throw new bizError('创建日志文件错误', err)
                    } else {
                        const contentWillWrite = `${utils.formatDate('{Y}-{m}-{d} {H}:{i}:{s}')} ${type} : ${JSON.stringify(content)} \n`
                        fs.writeFile(fd, contentWillWrite, err => {
                            if (err) {
                                throw new bizError('写入日志文件失败', err)
                            }
                        })
                    }
                })
            }
        })
    }

    static info(content) {
        console.info(content)
        return this.write('info', content)
    }

    static error(content) {
        console.error(content)
        return this.write('error', content)
    }

    static warining(content) {
        console.log(content)
        return this.write('warning', content)
    }
}