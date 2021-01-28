const bizError = require("./exceptions/bizError")
const db = require('./db')
const log = require("./log")

module.exports = class mysqlBuilder {
    constructor() {
        if (!global.mysql) {
            throw new bizError('没有mysql实例')
        }
    }

    /**
     * sql类型
     * insert
     * update
     * delete
     * select
     */
    #mode = ''

    /**
     * 设定操作表
     * @param {*} table 
     */
    from(table) {
        this.#table = table
        return this
    }
    #table = ''

    /**
     * 分组查询条件
     * @param {Array} fields 
     */
    groupBy(fields) {
        this.#groupArr = fields
        return this
    }
    #groupArr = []

    /**
     * 设定选择列
     * 数组或字符串
     * @param {*} fields 
     */
    select(fields) {
        this.#mode = 'select'
        if (typeof fields == 'string') {
            fields = fields.split(',')
        }
        fields.forEach(v => {
            if (!this.#fieldsArr.includes(v)) {
                this.#fieldsArr.push(v)
            }
        })
        return this
    }
    #fieldsArr = []

    /**
     * where("is_del = 0")
     * where(is_del, 0)
     * where(is_del, '>', 0)
     * where({
     *      'is_del' => 0,
     *      'is_del' => ['>', 0]
     *      '_logic' => "and | or",
     *      '_complex' => [
     *          'is_del' => 0
     *      }
     * ])
     */
    #buildWhere = function() {
        const args = Array(...arguments)
        let sqlClip = ''
        switch (args.length) {
            case 1: {
                if (typeof args[0] == 'string') {
                    sqlClip = `${args[0]}`
                }
                if (typeof args[0] == 'object') {
                    let _logic = 'and'
                    if (args[0]._logic && args[0]._logic == 'or') {
                        _logic = 'or'
                    }
                    
                    let sqlClip2Arr = []
                    Object.keys(args[0]).forEach(k => {
                        
                        let v = args[0][k]
                        let sqlClip2 = ''
                        
                        if (k == '_logic') {}
                        else if (k == '_complex') {
                            sqlClip2 = `${_logic} (${this.#buildWhere(v)})`
                        }
                        else if(Array.isArray(v)) {
                            if (typeof v[1] == 'string') {
                                v[1] = `'${v[1]}'`
                            }
                            sqlClip2 = `${_logic} \`${k}\` ${v[0]} ${v[1]}`
                        }
                        else if(typeof v == 'string') {
                            v = `'${v}'`
                            sqlClip2 = `${_logic} \`${k}\` = ${v}`
                        } else {
                            sqlClip2 = `${_logic} \`${k}\` = ${v}`
                        }

                        sqlClip2Arr.push(sqlClip2)
                    })
                    sqlClip = sqlClip2Arr.join(' ')
                }
            }break;
            case 2: {
                if (typeof args[1] == 'string') {
                    args[1] = `'${args[1]}'`
                }
                sqlClip = `and \`${args[0]}\` = ${args[1]}`
            }break;
            case 3: {
                if (typeof args[2] == 'string') {
                    args[2] = `'${args[2]}'`
                }
                sqlClip = `and \`${args[0]}\` ${args[1]} ${args[2]}`
            }break;
        }

        sqlClip = sqlClip.replace(/and|or/, '', 1)
        return sqlClip
    }

    where(whereObj) {
        this.#where = this.#buildWhere(whereObj)
        return this
    }

    /**
     * 查询条件
     * 就一个字符串，不能数组
     * 一次查询只能用一次
     */
    #where = " 1=1"

    /**
     * 分页
     */
    #page = null
    page(page) {
        this.#page = page
        return this
    }

    /**
     * 每页几个
     */
    #limit = null
    limit(limit) {
        this.#limit = limit
        return this
    }

    /**
     * 排序
     */
    #orderBy = []
    order(field, method = 'asc') {
        this.#orderBy.push(`${field} ${method}`)
        return this
    }

    /**
     * 连表
     */
    #joinArr = []
    leftJoin(table, on) {
        this.#joinArr.push(`left join ${table} on ${on}`)
        return this
    }
    rightJoin(table, on) {
        this.#joinArr.push(`right join ${table} on ${on}`)
        return this
    }
    innerJoin(table, on) {
        this.#joinArr.push(`inner join ${table} on ${on}`)
        return this
    }

    /**
     * 插入模式
     * @param {string} table 表
     * @param {bool} batch 是否批量
     */
    insert(table, batch = false) {
        this.#mode = 'insert'
        this.#table = table
        if (batch == true) {
            this.#batchInsert = true
        }
        return this
    }
    #batchInsert = false

    /**
     * 设置数据对象
     * @param {object} data 
     */
    data(data) {
        this.#data = data
        return this
    }
    #data = {}

    /**
     * 模式-修改
     * @param {string} table 
     */
    update(table) {
        this.#mode = 'update'
        this.#table = table
        return this
    }

    /**
     * 模式-删除
     * @param {string} table 
     */
    delete(table) {
        this.#mode = 'delete'
        this.#table = table
        return this
    }
    /**
     * 构建sql
     */
    #buildSql = function(){
        switch (this.#mode) {
            case 'select': {
                const sqlArr = [
                    "select"
                ]
                if (this.#fieldsArr.length == 0) {
                    sqlArr.push('*')
                } else {
                    sqlArr.push(this.#fieldsArr.join(','))
                }
                sqlArr.push(`from ${this.#table}`)
                
                if (this.#joinArr.length > 0) {
                    this.#joinArr.forEach(v => {
                        sqlArr.push(v)
                    })
                }

                sqlArr.push(`where${this.#where}`)

                if (this.#groupArr.length > 0) {
                    sqlArr.push(`group by ` + this.#groupArr.join(','))
                }

                if (this.#orderBy.length > 0) {
                    sqlArr.push(`order by ` + this.#orderBy.join(','))
                }
                if (this.#page !== null && this.#limit !== null) {
                    sqlArr.push(`limit ${this.#limit * (this.#page - 1)}, ${this.#limit}`)
                }

                return sqlArr.join(' ') + ';'
            }

            case 'insert': {
                if (this.#batchInsert) {
                    const sqlArr = [
                        `insert into ${this.#table}`
                    ]
                    const keyArr = Object.keys(this.#data[0]).map(v => `\`${v}\``)
                    
                    sqlArr.push(`(${keyArr.join(',')})`)
                    sqlArr.push(`values`)
                    sqlArr.push(this.#data.map(v => {
                        return '(' + Object.values(v).map(vv => {
                            if (typeof vv == 'string') {
                                vv = `'${vv}'`
                            }
                            return vv
                        }).join(', ') + ')'
                    }).join(', '))

                    return sqlArr.join(' ') + ';'
                } else {
                    const sqlArr = [
                        `insert into ${this.#table}`
                    ]
                    const keyArr = []
                    const valueArr = []
                    Object.keys(this.#data).forEach(k => {
                        let v = this.#data[k]
                        keyArr.push(`\`${k}\``)
                        if (typeof v == 'string') {
                            v = `'${v}'`
                        }
                        valueArr.push(v)
                    })
                    sqlArr.push(`(${keyArr.join(', ')})`)
                    sqlArr.push(`values (${valueArr.join(', ')})`)
    
                    return sqlArr.join(' ') + ';'
                }
            }

            case 'update': {
                const sqlArr = [
                    `update ${this.#table} set`
                ]
                sqlArr.push(Object.keys(this.#data).map(k => {
                    let v = this.#data[k]
                    if (typeof v == 'string') {
                        v = `'${v}'`
                    }
                    return `\`${k}\` = ${v}`
                }).join(', '))

                sqlArr.push(`where${this.#where}`)
                
                return sqlArr.join(' ') + ';'
            }

            case 'delete': {
                const sqlArr = [
                    `delete from ${this.#table}`,
                    `where${this.#where}`
                ]

                return sqlArr.join(' ') + ';'
            }
        }
    }

    /**
     * 获取构建完成的sql
     */
    toSql() {
        return this.#buildSql()
    }

    /**
     * 是否在事务中
     */
    static inTranscation = false
    /**
     * 执行操作时为事务积累sql
     */
    static transcationSqlStack = []

    /**
     * 执行查询
     * @param {object} dbRes 
     */
    query() {
        const sql = this.#buildSql()
        if (mysqlBuilder.inTranscation) {
            mysqlBuilder.transcationSqlStack.push(sql)
            return;
        }
        return new Promise((resolve, reject) => {
            db.query(sql).then(dbRes => {
                switch (this.#mode) {
                    case 'select': resolve(this.#dbResToObject(dbRes))
                    case 'insert': resolve(this.#dbResToObject(dbRes).insertId)
                    case 'delete': resolve(this.#dbResToObject(dbRes).affectedRows)
                    case 'update': resolve(this.#dbResToObject(dbRes).affectedRows)
                }
            }).catch(e => {
                reject(e)
            })
        })
    }

    /**
     * 只取一行数据
     */
    row() {
        if (this.#mode != 'select') {
            throw new bizError('数据库查询模式不是select，请检查sql', this.#buildSql())
        }
        const sql = this.#buildSql()
        return new Promise((resolve, reject) => {
            this.#limit = 1
            db.query(sql).then(dbRes => {
                resolve(this.#dbResToObject(dbRes)[0])
            }).catch(e => {
                reject(e)
            })
        })
    }

    /**
     * 只取一个值
     */
    single() {
        if (this.#mode != 'select') {
            throw new bizError('数据库查询模式不是select，请检查sql', this.#buildSql())
            return;
        }
        const sql = this.#buildSql()
        return new Promise((resolve, reject) => {
            this.#limit = 1
            this.#page = 1
            this.#fieldsArr = [this.#fieldsArr[0]]
            db.query(sql).then(dbRes => {
                dbRes = this.#dbResToObject(dbRes)
                resolve(dbRes[0][Object.keys(dbRes[0])[0]])
            }).catch(e => {
                reject(e)
            })
        })
    }

    /**
     * 查询符合条件的条数
     */
    count() {
        if (this.#mode != 'select') {
            throw new bizError('数据库查询模式不是select，请检查sql', this.#buildSql())
        }
        return new Promise((resolve, reject) => {
            this.#fieldsArr = ["count(*) as c"]
            db.query(this.#buildSql()).then(dbRes => {
                dbRes = this.#dbResToObject(dbRes)
                resolve(dbRes[0]['c'])
            }).catch(e => {
                reject(e)
            })
        })
    }

    /**
     * 将数据库取到的数据转换成对象
     * @param {object} dbRes 
     */
    #dbResToObject = function(dbRes) {
        let obj = JSON.parse(JSON.stringify(dbRes))
        if (Array.isArray(obj)) {
            obj = obj.map(v => {
                return this.#dbResToObject(v)
            })
        }
        if (typeof obj == 'object') {
            Object.keys(obj).forEach(k => {
                let v = obj[k]
                if (v && v.type && v.type == 'Buffer') {
                    v = this.#bufferToString(v)
                }
                obj[k] = v
            })
        }
        return obj
    }

    /**
     * buffer转字符串
     * @param {Buffer} buffer 
     */
    #bufferToString = function(buffer) {
        const bfArr = JSON.parse(JSON.stringify(buffer)).data
        return Buffer.from(bfArr).toString()
    }

    /**
     * 开启事务
     * @param {closure} closure 
     */
    async beginTransaction(closure) {
        // mysqlBuilder.inTranscation = true
        // closure()
        return new Promise((resolve, reject) => {
            global.mysql.beginTransaction(err => {
                try {
                    // console.log(mysqlBuilder.transcationSqlStack)
                    // const sql = mysqlBuilder.transcationSqlStack.join("")
                    // global.mysql.query(sql, (error, results, fields) => {
                    //     if (error) {
                    //         const err = ['mysql error', error]
                    //         log.error(err)
                    //         reject(err)
                    //     }

                    //     global.mysql.commit((err, info) => {
                    //         if (err) {
                    //             reject(err)
                    //         } else {
                    //             resolve(results)
                    //         }
                    //     }) 
                    // })
                    closure()
                    global.mysql.commit((err, info) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(info)
                        }
                    }) 
                } catch (e) {
                    console.log(e)
                    global.mysql.rollback(err => {
                        if (err) {
                            console.log(err)
                            reject(err)
                        }
                    })
                }
            })
        })
    }
}