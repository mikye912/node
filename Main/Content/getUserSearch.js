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
      orgcd : obj.uInfo[1],
      pages : obj.pages,
    };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };
    
    let query = `
    SELECT 
      PAGE,
      NAME, 
      FIELD, 
      TYPE, 
      DEFAULT_YN, 
      SORT
    FROM TB_BAS_SEARCHBOX_NEW
    WHERE ORG_CD = :orgcd AND PAGE = :pages
    ORDER BY PAGE ASC, DEFAULT_YN DESC, SORT ASC
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

