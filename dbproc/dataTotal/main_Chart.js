const dbConfig = require('$Common/dbconfig');

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
        APPDD,
        CASE
        WHEN TYPE='CARD' THEN '신용매출'
        WHEN TYPE='CASH' THEN '현금매출'
        WHEN TYPE='CASHIC' THEN '현금IC매출' END AS TYPE,
        VALUE
      FROM 
      (
        SELECT
          APPDD,
          NVL(SUM(ACARD) - SUM(CCARD),0) AS CARD,
          NVL(SUM(ACASH) - SUM(CCASH),0) AS CASH,
          NVL(SUM(ACASHIC) - SUM(CCASHIC),0) AS CASHIC
        FROM
        (
          SELECT 
            SUBSTR(APPDD,7,9) APPDD,
            CASE WHEN SVCGB IN ('CC','CE') AND APPGB = 'A' THEN SUM(AMOUNT) ELSE 0 END ACARD,
            CASE WHEN SVCGB IN ('CC','CE') AND APPGB = 'C' THEN SUM(AMOUNT) ELSE 0 END CCARD,
            CASE WHEN SVCGB='CB' AND APPGB = 'A' THEN SUM(AMOUNT) ELSE 0 END ACASH,
            CASE WHEN SVCGB='CB' AND APPGB = 'C' THEN SUM(AMOUNT) ELSE 0 END CCASH,
            CASE WHEN SVCGB='IC' AND APPGB = 'A' THEN SUM(AMOUNT) ELSE 0 END ACASHIC,
            CASE WHEN SVCGB='IC' AND APPGB = 'C' THEN SUM(AMOUNT) ELSE 0 END CCASHIC
          FROM GLOB_MNG_ICVAN_NICE
          WHERE SVCGB IN ('CC','CE','CB','IC') AND AUTHCD='0000' AND TID IN (SELECT TID FROM TB_BAS_TIDMAP WHERE ORG_CD=:orgcd) 
          AND APPDD LIKE TO_CHAR(SYSDATE,'YYYYMM')||'%' 
          GROUP BY SVCGB, APPGB, APPDD
          ORDER BY APPDD
        ) 
        GROUP BY APPDD 
        ORDER BY APPDD
      )
      UNPIVOT (
        VALUE
        FOR 
        TYPE IN(CARD,CASH,CASHIC)
      )
      `
      , binds, options);

    let rst = result.rows;
    //console.log(result);
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