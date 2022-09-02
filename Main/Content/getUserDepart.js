const config = require('$Common/config');
const common = require('$Common/common');

async function run(oracledb, obj) {
  let connection;

  let whDepCd = obj.uInfo[2] ? ` AND DEP_CD = '${obj.uInfo[2]}' ` : ``;
  
  try {
    connection = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: config.connectString
    });
    oracledb.autoCommit = true;

    let binds = {
      orgcd : obj.uInfo[1],
    };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };
    let query = `
    SELECT DEP_NM AS NAME, DEP_CD AS VALUE FROM TB_BAS_DEPART WHERE ORG_CD=:orgcd ${whDepCd}
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

