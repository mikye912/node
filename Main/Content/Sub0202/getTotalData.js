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

    let AUTH_WH = new Array();
    let WH = new Array();
    let ORG_WH = "";
    let USER_AUTH = "";
    let ADDWHERE = "";
    if (obj.where.DEP_CD) {
      AUTH_WH = [...AUTH_WH, ` DEP_CD IN ('${obj.where.DEP_CD.join("','")}') `];
    }
    if (obj.uInfo[1]) {
      AUTH_WH = [...AUTH_WH, ` ORG_CD = '${obj.uInfo[1]}' `];
      ORG_WH = `WHERE ORG_CD='${obj.uInfo[1]}'`;
    }
    if (obj.uInfo[2]) {
      AUTH_WH = [...AUTH_WH, ` DEP_CD = '${obj.uInfo[2]}' `];
    }

    if (!common.isEmptyArr(AUTH_WH)) {
      USER_AUTH = ` WHERE ${AUTH_WH.join(' AND ')} `;
    }

    if (obj.where.SDATE) {
      WH = [...WH, ` T1.APPDD >= '${common.regReplace(obj.where.SDATE)}' `];
    }
    if (obj.where.EDATE) {
      WH = [...WH, ` T1.APPDD <= '${common.regReplace(obj.where.EDATE)}' `];
    }
    if (obj.where.SAMOUNT) {
      WH = [...WH, ` T1.AMOUNT >= '${common.regReplace(obj.where.SAMOUNT)}' `];
    }
    if (obj.where.EAMOUNT) {
      WH = [...WH, ` T1.AMOUNT <= '${common.regReplace(obj.where.EAMOUNT)}' `];
    }
    if (obj.where.APPNO) {
      WH = [...WH, ` T1.APPNO = '${obj.where.APPNO}' `];
    }
    if (obj.where.ADD_CID) {
      WH = [...WH, ` T1.ADD_CID LIKE '%${obj.where.ADD_CID}%' `];
    }
    if (obj.where.ACQ_CD) {
      const ACQ_CD = obj.where.ACQ_CD;
      WH = [...WH, ` T1.ACQ_CD IN ('${ACQ_CD.split(',').join("','")}') `];
    }
    if (obj.where.TID) {
      WH = [...WH, ` T1.TID IN ('${obj.where.TID.join("','")}') `];
    }

    if (obj.where.MID) {
      WH = [...WH, ` T1.MID LIKE '%${obj.where.MID}%' `];
    }
    if (obj.where.ADD_CASHER) {
      WH = [...WH, ` T1.ADD_CASHER = '${obj.where.ADD_CASHER}' `];
    }
    if (obj.where.ADD_CD) {
      WH = [...WH, ` T1.ADD_CD = '${obj.where.ADD_CD}' `];
    }
    if (obj.where.ADD_GB) {
      let ADD_GB = '';
      switch (obj.where.ADD_GB) {
        case 'O': ADD_GB = "'1', 'O'"; break;
        case 'E': ADD_GB = "'2', 'E'"; break;
        case 'I': ADD_GB = "'3', 'I'"; break;
        case 'C': ADD_GB = "'4', 'C'"; break;
        case 'G': ADD_GB = "'5', 'G'"; break;
        default: ADD_GB = ""; break;
      }
      WH = [...WH, ` T1.ADD_GB IN (${ADD_GB}) `];
    }
    if (obj.where.CARDNO) {
      WH = [...WH, ` T1.MEDI_GOODS LIKE '%${obj.where.CARDNO}%' `];
    }
    if (obj.where.OVSEA_CARD) {
      if (obj.where.OVSEA_CARD === 'Y') {
        WH = [...WH, ` T1.ISS_CD IN ('09') `];
      } else {
        WH = [...WH, ` T1.ISS_CD NOT IN ('09') `];
      }
    }
    if (obj.where.CHECK_CARD) {
      if (obj.where.CHECK_CARD === 'Y') {
        WH = [...WH, ` T1.CHECK_CARD = 'Y' `];
      } else {
        WH = [...WH, ` T1.CHECK_CARD = 'N' `];
      }
    }
    if (!common.isEmptyArr(WH)) {
      ADDWHERE = ` AND ${WH.join(' AND ')} `;
    }

    let SET_WHERE = `WHERE SVCGB IN ('CC', 'CE') AND AUTHCD='0000' AND TID IN (SELECT TID FROM TB_BAS_TIDMAP ${USER_AUTH})  ${ADDWHERE}`;

    let AUTH_IN = new Array();
    let EXTRA_WH = new Array();
    let EXTRA_WHERE = "";

    if (obj.where.APPGB) {
      if (obj.where.APPGB.find(a => a === 'A')) {
        AUTH_IN = [...AUTH_IN, `신용승인`];
      }
      if (obj.where.APPGB.find(a => a === 'C')) {
        AUTH_IN = [...AUTH_IN, `신용취소`];
      }
      if (!common.isEmptyArr(AUTH_IN)) {
        EXTRA_WH = [...EXTRA_WH, ` APPGB_TXT IN ('${AUTH_IN.join("','")}') `];
      }
    }

    if (obj.where.AUTHSTAT) {
      EXTRA_WH = [...EXTRA_WH, ` AUTHSTAT IN ('${obj.where.AUTHSTAT.join("','")}') `];
    }

    if (!common.isEmptyArr(EXTRA_WH)) {
      EXTRA_WHERE = ` WHERE ${EXTRA_WH.join(' AND ')} `;
    }

    let binds = {
      orgcd: obj.uInfo[1],
    };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    let query = `
    SELECT 
      APPDD,
      PUR_NM,
      TOTCNT,
      TOTAMT,
      ACNT,
      AAMT,
      CCNT,
      CAMT
    FROM
      (
      SELECT 
        APPDD, 
        CASE 
          WHEN GROUPING(PUR_NM) = 1 AND GROUPING(APPDD) = 1 THEN '합계'
          WHEN PUR_NM IS NULL THEN '소계' ELSE PUR_NM
        END PUR_NM, 
        GROUPING(APPDD) AS GR_APPDD,
        GROUPING(PUR_NM) AS GR_PUR_NM,
        SUM(ACNT+CCNT) AS TOTCNT, 
        SUM(AAMT-CAMT) AS TOTAMT, 
        SUM(ACNT) AS ACNT, 
        SUM(AAMT) AS AAMT, 
        SUM(CCNT) AS CCNT, 
        SUM(CAMT) AS CAMT
      FROM(
        SELECT
          ACQ_CD, 
          APPDD, 
          SUM(ACNT) AS ACNT, 
          SUM(CCNT) AS CCNT, 
          SUM(AAMT) AS AAMT, 
          SUM(CAMT) AS CAMT
        FROM(
          SELECT
            ACQ_CD,
            APPDD,
            CASE
              WHEN APPGB='A' THEN COUNT(1) ELSE 0 
            END ACNT,
            CASE
              WHEN APPGB='A' THEN SUM(AMOUNT) ELSE 0
            END AAMT,
            CASE
              WHEN APPGB='C' THEN COUNT(1) ELSE 0
            END CCNT,
            CASE
              WHEN APPGB='C' THEN SUM(AMOUNT) ELSE 0
            END CAMT
          FROM 
            GLOB_MNG_ICVAN_NICE
            ${SET_WHERE}
          GROUP BY ACQ_CD, APPDD, APPGB
        )T1
        GROUP BY ACQ_CD, APPDD
      )T1
      LEFT OUTER JOIN( SELECT PUR_NM, PUR_KOCES, PUR_OCD, PUR_KIS, PUR_NICE, PUR_CD, PUR_SORT FROM TB_BAS_PURINFO)T5 ON(T1.ACQ_CD=T5.PUR_OCD OR T1.ACQ_CD=T5.PUR_KOCES OR T1.ACQ_CD=T5.PUR_CD OR T1.ACQ_CD=T5.PUR_KIS OR T1.ACQ_CD=T5.PUR_NICE)
      GROUP BY ROLLUP(APPDD, PUR_NM)
      ) 
    ORDER BY GR_APPDD DESC, APPDD, GR_PUR_NM ASC
    `

    let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
    common.logger('info', `query debug => ${debugQuery}`);

    result = await connection.execute(query, binds, options);

    let rst = result.rows;
    //console.log(rst)
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