const config = require('$Common/config');
const common = require('$Common/common');

async function run(oracledb, obj, res) {
    let connection;

    const binds = {
        userId: obj.uInfo[0]
    }

    try {
        connection = await oracledb.getConnection({
            user: config.user,
            password: config.password,
            connectString: config.connectString
        });
        oracledb.autoCommit = true;

        let options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        let query = `
        SELECT 
            T2.PROGRAM_NAME,
            T2.PROGRAM_SEQ,
            T2.SRC_LOCATION,
            T2.SORT AS SORT1,
            T1.USE_YN,
            T1.SORT AS SORT2
        FROM TB_SYS_FAVORITE T1
        LEFT OUTER JOIN (
            SELECT PROGRAM_SEQ, PROGRAM_NAME, SORT, SRC_LOCATION FROM TB_SYS_PROGRAM_TEMP
        ) T2 ON(T1.PROGRAM_SEQ = T2.PROGRAM_SEQ)
        WHERE USER_ID=:userId AND LENGTH(T1.PROGRAM_SEQ) > 2
        ORDER BY T2.SORT
        `

        let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
        common.logger('info', `query debug => ${debugQuery}`);

        result = await connection.execute(query, binds, options);

        let rst = result.rows;
        return rst;
    } catch (err) {
        console.error(err);
        res.status(500).json({
            dbErr: err
        })
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