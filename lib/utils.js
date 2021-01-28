module.exports = {
    formatDate(format = '{Y}-{m}-{d} {H}:{i}:{s}', dateObj = null) {
        if (dateObj === null) {
            dateObj = new Date()
        }
        const d = new Date(dateObj)
        return format
            .replace('{Y}', d.getFullYear())
            .replace('{m}', d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`)
            .replace('{d}', d.getDate() < 10 ? `0${d.getDate()}` : `${d.getDate()}`)
            .replace('{H}', d.getHours() < 10 ? `0${d.getHours()}` : `${d.getHours()}`)
            .replace('{i}', d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`)
            .replace('{s}', d.getSeconds() < 10 ? `0${d.getSeconds()}` : `${d.getSeconds()}`)
    }
}