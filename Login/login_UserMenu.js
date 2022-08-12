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

    let binds = {
      authSeq : obj.AUTH_SEQ,
      orgCd : obj.MEMBER_ORG
    };
    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    result = await connection.execute(
      `
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
      WHERE A.AUTH_SEQ=:authSeq AND ORGCD=:orgCd
      ORDER BY A.PROGRAM_SEQ, B.SORT ASC
      `
      , binds, options);
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

