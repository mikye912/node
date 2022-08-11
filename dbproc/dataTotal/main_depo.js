const dbConfig = require('../../common/dbconfig');

async function run(oracledb, obj) {
  let connection;
  let orgcd = obj.orgcd;

  try {
    connection = await oracledb.getConnection({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString
    });
    oracledb.autoCommit = true;

    let binds = {
        orgcd: orgcd
    };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    result = await connection.execute(
      `
      SELECT 
        SALE_AMT,
        FEE,
        SALE_AMT - FEE AS EXP_AMT
      FROM
      (
        SELECT 
          NVL(SUM(ASALE_AMT) - SUM(CSALE_AMT),0) AS SALE_AMT,
          NVL(SUM(AFEE) - SUM(CFEE),0) AS FEE
        FROM
        (
          SELECT 
            CASE WHEN RTN_CD = '60' THEN SUM(SALE_AMT) ELSE 0 END ASALE_AMT,
            CASE WHEN RTN_CD = '67' THEN SUM(SALE_AMT) ELSE 0 END CSALE_AMT,
            CASE WHEN RTN_CD = '60' THEN SUM(FEE) ELSE 0 END AFEE,
            CASE WHEN RTN_CD = '67' THEN SUM(FEE) ELSE 0 END CFEE
          FROM TB_MNG_DEPDATA_NICE
          WHERE MID IN (SELECT MID FROM TB_BAS_MIDMAP WHERE ORG_CD=:orgcd) AND RTN_CD IN('60','67') AND EXP_DD=TO_CHAR(SYSDATE,'YYYYMMDD')
          GROUP BY RTN_CD
        )
      )
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