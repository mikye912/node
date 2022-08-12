const dbConfig = require('$Common/dbconfig');

async function run(oracledb, obj) {
  let connection;
  let orgcd = obj.orgcd;
  let userid = obj.userid;
  let authseq = obj.authseq;

  try {
    connection = await oracledb.getConnection({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString
    });
    oracledb.autoCommit = true;

    let binds = {
        orgcd: orgcd,
        userid: userid,
        authseq: authseq
    };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    result = await connection.execute(
      `
      SELECT 
        MENU_NAME, SRC_LOCATION, T1.PROGRAM_SEQ
      FROM TB_SYS_FAVORITE T1
      LEFT OUTER JOIN (SELECT PROGRAM_SEQ, MENU_NAME FROM TB_SYS_MENU WHERE ORGCD=:orgcd AND AUTH_SEQ=:authseq)T2 
       ON (T1.PROGRAM_SEQ=T2.PROGRAM_SEQ)
      LEFT OUTER JOIN (SELECT PROGRAM_SEQ, SRC_LOCATION, SORT FROM TB_SYS_PROGRAM_TEMP)T3 
       ON (T2.PROGRAM_SEQ=T3.PROGRAM_SEQ)
      WHERE T1.USER_ID =:userid AND USE_YN ='N' AND LENGTH(T1.PROGRAM_SEQ) > 2 ORDER BY T3.SORT
      `
      , binds, options);

    let rst = result.rows;
    if(rst!=''){
      return rst;
    }else{
      return result.metaData;
    }
   
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