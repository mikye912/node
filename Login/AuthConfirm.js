const config = require('$Common/config');
const common = require('$Common/common');

async function run(oracledb, obj) {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: config.user,
            password: config.password,
            connectString: config.connectString
        });
        oracledb.autoCommit = true;

        let binds = {
            USER_ID: obj.userId
        };
        let options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        let query = `
        SELECT TRANS_NO FROM TB_BAS_USER WHERE USER_ID = :USER_ID
        `

        let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
        common.logger('info', `query debug => ${debugQuery}`);

        result = await connection.execute(query, binds, options);

        let rst = result.rows;
        //console.log(rst)

        return rst;
    } catch (err) {
        console.log(err)
        return err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}
module.exports.run = run;

