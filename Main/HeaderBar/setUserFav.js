const config = require('$Common/config');

async function run(oracledb, obj) {
    let connection;

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

        result = await connection.execute(
            `
            UPDATE TB_SYS_FAVORITE SET
            USE_YN=CASE WHEN PROGRAM_SEQ IN('${obj.seq}') THEN 'Y' ELSE 'N' END,
            SORT=${obj.sort}
            WHERE user_id='${obj.uInfo[0]}'
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