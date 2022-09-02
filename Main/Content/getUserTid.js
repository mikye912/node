const config = require('$Common/config');
const common = require('$Common/common');

async function run(oracledb, obj) {
  let connection;

  let whDepCd = obj.MEMBER_DEPO ? ` AND DEP_CD = '${obj.MEMBER_DEPO}' ` : ``;

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
    SELECT 
      TITLE,
      NAME,
      VALUE
    FROM
    (
    SELECT 
      TERM_NM AS NAME,
      TERM_ID AS VALUE,
      DEP_CD
    FROM TB_BAS_TIDMST
    WHERE ORG_CD=:orgcd ${whDepCd}
    ORDER BY TERM_SORT ASC
    ) T1
    LEFT OUTER JOIN (
      SELECT DEP_NM AS TITLE, DEP_CD FROM TB_BAS_DEPART WHERE ORG_CD=:orgcd ${whDepCd}
    ) T2 ON(T1.DEP_CD = T2.DEP_CD)
    ORDER BY TITLE ASC, NAME ASC
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

