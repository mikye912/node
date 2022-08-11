const dbConfig = require('../../common/dbconfig');

async function run(oracledb, obj) {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });
        oracledb.autoCommit = true;

        let options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        result = await connection.execute(
            `
            UPDATE TB_SYS_FAVORITE SET
            USE_YN=CASE WHEN PROGRAM_SEQ IN('${obj.seq}') THEN 'Y' ELSE 'N' END,
            SORT=${obj.sort}
            WHERE user_id='${obj.userId}'
            `
            , [], options);
        let rst = result.rowsAffected;
        return {rst : rst};
    } catch (err) {
        console.error(err);
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