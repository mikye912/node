const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: "./instantclient_21_7" }); // Window
//oracledb.initOracleClient({ configDir: "./instantclient_21_7" }); // Linux
const sql = require('bind-sql-string');

module.exports = {
    async getData(url, obj, res) {
        return await require(url).run(oracledb, obj, res);
    },
    getDataAll(arr) {
        return Promise.all(arr).then((res) => { return res; })
    },
    createPromise(url, obj) {
        return require(url).run(oracledb, obj);
    },
    queryBindToString(query, binds) {
        return sql.queryBindToString(query, binds, {quoteEscaper:"''"});
    }
}
