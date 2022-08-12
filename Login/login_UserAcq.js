const dbConfig = require('$Common/dbconfig');

async function run(oracledb) {
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
    SELECT PUR_CD ||','||PUR_KIS AS VALUE, PUR_NM AS NAME FROM TB_BAS_PURINFO WHERE PUR_USE='Y' ORDER BY PUR_SORT ASC
    `
    result = await connection.execute(query, [], options);
    
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

