const config = require('$Common/config');

async function run(oracledb, obj) {
    let connection;

    const TRANS_NO = Math.floor(Math.random() * (999999-100000)) + 100000; // 100000 ~ 999999 사이의 정수를 반환
    let res = {
        TRANS_NO : TRANS_NO,
        data : []
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


        result = await connection.execute(
            `
            UPDATE TB_BAS_USER SET TRANS_NO = :TRANS_NO 
            WHERE USER_ID = :USER_ID
            `
            , binds, options);

        let rst = result.rowsAffected;
        
        if (rst > 0) {
            result = await connection.execute(
            `
            SELECT 
                USER_TEL2, 
                USER_ID 
            FROM TB_BAS_USER 
                WHERE USER_ID = :USER_ID
            `
            , {USER_ID: obj.userId}, options);

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

