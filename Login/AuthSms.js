const config = require('$Common/config');
const common = require('$Common/common');

async function run(oracledb, obj) {
    let connection;

    const TRANS_NO = Math.floor(Math.random() * (999999 - 100000)) + 100000; // 100000 ~ 999999 사이의 정수를 반환
    let res = {
        TRANS_NO: TRANS_NO,
        data: []
    };

    try {
        connection = await oracledb.getConnection({
            user: config.user,
            password: config.password,
            connectString: config.connectString
        });
        oracledb.autoCommit = true;

        let binds = {
            USER_ID: obj.userId,
            TRANS_NO: TRANS_NO
        };
        let options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        let query = `
        UPDATE TB_BAS_USER SET TRANS_NO = :TRANS_NO 
        WHERE USER_ID = :USER_ID
        `

        let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
        common.logger('info', `query debug => ${debugQuery}`);

        result = await connection.execute(query, binds, options);

        let rst = result.rowsAffected;

        if (rst > 0) {

            let query = `
            SELECT 
                USER_TEL2, 
                USER_ID 
            FROM TB_BAS_USER 
                WHERE USER_ID = :USER_ID
            `

            let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
            common.logger('info', `query debug => ${debugQuery}`);

            result = await connection.execute(query, { USER_ID: obj.userId }, options);

            res.data = result.rows;
        }

        return res;
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

