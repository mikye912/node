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
        CARD,
        CARDCNT,
        CASH,
        CASHCNT,
        CASHIC,
        CASHICCNT,
        CARD + CASH + CASHIC AS TOTAMT,
        CARDCNT + CASHCNT + CASHICCNT AS TOTCNT
      FROM
      (
        SELECT 
          NVL(SUM(ACARD) - SUM(CCARD),0) AS CARD,
          NVL(SUM(ACARDCNT) + SUM(CCARDCNT),0) AS CARDCNT,
          NVL(SUM(ACASH) - SUM(CCASH),0) AS CASH,
          NVL(SUM(ACASHCNT) + SUM(CCASHCNT),0) AS CASHCNT,
          NVL(SUM(ACASHIC) - SUM(CCASHIC),0) AS CASHIC,
          NVL(SUM(ACASHICCNT) + SUM(CCASHICCNT),0) AS CASHICCNT
        FROM
        (
          SELECT 
            CASE WHEN SVCGB IN ('CC','CE') AND APPGB = 'A' THEN SUM(AMOUNT) ELSE 0 END ACARD,
            CASE WHEN SVCGB IN ('CC','CE') AND APPGB = 'C' THEN SUM(AMOUNT) ELSE 0 END CCARD,
            CASE WHEN SVCGB IN ('CC','CE') AND APPGB = 'A' THEN COUNT(1) ELSE 0 END ACARDCNT,
            CASE WHEN SVCGB IN ('CC','CE') AND APPGB = 'C' THEN COUNT(1) ELSE 0 END CCARDCNT,
            CASE WHEN SVCGB='CB' AND APPGB = 'A' THEN SUM(AMOUNT) ELSE 0 END ACASH,
            CASE WHEN SVCGB='CB' AND APPGB = 'C' THEN SUM(AMOUNT) ELSE 0 END CCASH,
            CASE WHEN SVCGB='CB' AND APPGB = 'A' THEN COUNT(1) ELSE 0 END ACASHCNT,
            CASE WHEN SVCGB='CB' AND APPGB = 'C' THEN COUNT(1) ELSE 0 END CCASHCNT,
            CASE WHEN SVCGB='IC' AND APPGB = 'A' THEN SUM(AMOUNT) ELSE 0 END ACASHIC,
            CASE WHEN SVCGB='IC' AND APPGB = 'C' THEN SUM(AMOUNT) ELSE 0 END CCASHIC,
            CASE WHEN SVCGB='IC' AND APPGB = 'A' THEN COUNT(1) ELSE 0 END ACASHICCNT,
            CASE WHEN SVCGB='IC' AND APPGB = 'C' THEN COUNT(1) ELSE 0 END CCASHICCNT
          FROM GLOB_MNG_ICVAN_NICE WHERE SVCGB IN('CC','CE','CB','IC') AND AUTHCD='0000' AND TID IN (SELECT TID FROM TB_BAS_TIDMAP WHERE ORG_CD=:orgcd)  
          AND APPDD=TO_CHAR(SYSDATE-1 ,'YYYYMMDD')
          GROUP BY SVCGB, APPGB
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