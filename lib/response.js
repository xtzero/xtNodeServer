module.exports = class response {
    static ajax() {
        const args = Array(...arguments)
        let resData = {}
        switch (args.length) {
            case 1: resData = {
                data: args[0],
                msg: '',
                code: 200
            }; break;
            case 2: {
                if (typeof args[0] == 'string') {
                    resData = {
                        data: {},
                        msg: args[0],
                        code: args[1]
                    }
                } else {
                    resData = {
                        data: args[0],
                        msg: args[1],
                        code: 200
                    }
                }
            }; break;
            case 3: resData = {
                data: args[0],
                msg: args[1],
                code: args[2]
            }; break;
            default: resData = {
                data: args[0],
                msg: args[1],
                code: args[2]
            }; break;
        }

        if (!global.response) {
            console.log('还没有开启服务，想要输出的内容是：')
            console.log(...args)
        } else {
            global.response.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
            global.response.end(JSON.stringify(resData))
        }
    }
}