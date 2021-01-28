module.exports = class server {
    constructor(app) {
        const s = app.listen(global.env.server.port, () => {
            const host = s.address().address
            const port = s.address().port

            console.log(`应用已启动，请访问http://%s:%s`, host == '::' ? "localhost" : host, port)
        })
        return s
    }
}