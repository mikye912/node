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
      USER_ID, 
      USER_NM, 
      AUTH_SEQ, 
      ORG_CD
    FROM TB_BAS_USER 
    WHERE USER_ID=:userId
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

