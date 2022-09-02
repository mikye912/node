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
      authSeq: obj.uInfo[8],
      orgcd: obj.uInfo[1],
    };
    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    let query = `
    SELECT 
      A.PROGRAM_SEQ MENU_SEQ, 
      B.PROGRAM_NAME MENU_NAME, 
      B.DEPTH MENU_DEPTH, 
      B.PARENT_SEQ PARENT_SEQ, 
      A.ENABLE_READ AUTH_R, 
      A.ENABLE_CREATE AUTH_C, 
      A.ENABLE_UPDATE AUTH_U, 
      A.ENABLE_DELETE AUTH_D, 
      B.SRC_LOCATION MURL 
    FROM  
        TB_SYS_MENU A 
    LEFT OUTER JOIN 
        (SELECT PROGRAM_SEQ, PROGRAM_NAME, PARENT_SEQ, DEPTH, SRC_LOCATION, SORT FROM TB_SYS_PROGRAM_TEMP) B 
    ON (A.PROGRAM_SEQ=B.PROGRAM_SEQ) 
    WHERE A.AUTH_SEQ=:authSeq AND ORGCD=:orgcd
    ORDER BY A.PROGRAM_SEQ, B.SORT ASC
    `

    let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
    common.logger('info', `query debug => ${debugQuery}`);

    result = await connection.execute(query, binds, options);
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

