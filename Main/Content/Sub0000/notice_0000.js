const config = require('$Common/config');
const common = require('$Common/common');

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

    let query = `
    SELECT SEQNO, VANGB, CONTENT FROM TB_SYS_NOTICE ORDER BY INS_DT desc
    `

    let debugQuery = require('bind-sql-string').queryBindToString(query, {}, { quoteEscaper: "''" });
    common.logger('info', `query debug => ${debugQuery}`);

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