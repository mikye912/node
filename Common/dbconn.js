const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: "./instantclient_21_3" });

module.exports = {
    async getData(url, obj, res) {
        return await require(url).run(oracledb, obj, res);
    },
    getDataAll(arr) {
        return Promise.all(arr).then((res) => { return res; })
    },
    createPromise(url, obj) {
        return require(url).run(oracledb, obj);
    }
}
