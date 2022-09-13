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
            ORG_CD: obj.uInfo[1],
            USER_ID: obj.uInfo[0],
            PAGE: obj.page,
            CATEGORY: obj.category
        }
        let options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        let query = `
        BEGIN
        UPDATE TB_SYS_DOMAIN_NEW SET VISIABLE = ${obj.visiable}, SORT = ${obj.sort} WHERE ORG_CD = :ORG_CD AND USER_ID = :USER_ID AND PAGE = :PAGE AND CATEGORY = :CATEGORY ;
        COMMIT; END;
        `

        let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
        common.logger('info', `query debug => ${debugQuery}`);

        result = await connection.execute(query, binds, options);
        let rst = result.rowsAffected;
        return { rst: rst };
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