const dbConfig = require('$Common/dbconfig');

async function run(oracledb, obj) {
  let connection;

  let whDepCd = obj.MEMBER_DEPO ? ` AND DEP_CD = '${obj.MEMBER_DEPO}' ` : ``;

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
        TERM_NM AS NAME,
        TERM_ID AS VALUE
      FROM TB_BAS_TIDMST 
      WHERE ORG_CD=:orgCd AND TERM_ID IN ( 
        SELECT 
          TID 
        FROM TB_BAS_TIDMAP 
          WHERE ORG_CD=:orgCd ${whDepCd}
        ) 
      ORDER BY TERM_SORT ASC
    `
    result = await connection.execute(query, {orgCd : obj.MEMBER_ORG}, options);
    
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

