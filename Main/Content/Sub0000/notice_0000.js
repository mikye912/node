const config = require('$Common/config');

async function run(oracledb) {
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
      SELECT SEQNO, VANGB, CONTENT FROM TB_SYS_NOTICE ORDER BY INS_DT desc
      `
      , [], options);

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