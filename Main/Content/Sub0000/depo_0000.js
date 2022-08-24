const config = require('$Common/config');

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
        orgcd: obj.uInfo[1]
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
          FROM ${obj.uInfo[6]}
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