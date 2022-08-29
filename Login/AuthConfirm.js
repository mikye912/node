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

        let binds = {
            USER_ID: obj.userId
        };
        let options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };


        result = await connection.execute(
            `
            SELECT TRANS_NO FROM TB_BAS_USER WHERE USER_ID = :USER_ID
            `
            , binds, options);

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

