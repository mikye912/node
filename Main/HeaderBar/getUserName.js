const dbConfig = require('$Common/dbconfig');

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
    
    let query = `
    SELECT 
      USER_ID, 
      USER_NM, 
      AUTH_SEQ, 
      ORG_CD
    FROM TB_BAS_USER 
    WHERE USER_ID=:userId
    `
    result = await connection.execute(query, obj, options);
    
    let rst = result.rows;
    return rst;
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

