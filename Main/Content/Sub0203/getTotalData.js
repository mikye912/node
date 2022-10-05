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
      WH = [...WH, ` APPDD >= '${common.regReplace(obj.where.SDATE)}' `];
    }
    if (obj.where.EDATE) {
      WH = [...WH, ` APPDD <= '${common.regReplace(obj.where.EDATE)}' `];
    }
    if (obj.where.SAMOUNT) {
      WH = [...WH, ` AMOUNT >= '${common.regReplace(obj.where.SAMOUNT)}' `];
    }
    if (obj.where.EAMOUNT) {
      WH = [...WH, ` AMOUNT <= '${common.regReplace(obj.where.EAMOUNT)}' `];
    }
    if (obj.where.APPNO) {
      WH = [...WH, ` APPNO = '${obj.where.APPNO}' `];
    }
    if (obj.where.ADD_CID) {
      WH = [...WH, ` ADD_CID LIKE '%${obj.where.ADD_CID}%' `];
    }
    if (obj.where.ACQ_CD) {
      const ACQ_CD = obj.where.ACQ_CD;
      WH = [...WH, ` ACQ_CD IN ('${ACQ_CD.split(',').join("','")}') `];
    }
    if (obj.where.TID) {
      WH = [...WH, ` TID IN ('${obj.where.TID.join("','")}') `];
    }

    if (obj.where.MID) {
      WH = [...WH, ` MID LIKE '%${obj.where.MID}%' `];
    }
    if (obj.where.ADD_CASHER) {
      WH = [...WH, ` ADD_CASHER = '${obj.where.ADD_CASHER}' `];
    }
    if (obj.where.ADD_CD) {
      WH = [...WH, ` ADD_CD = '${obj.where.ADD_CD}' `];
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
      WH = [...WH, ` ADD_GB IN (${ADD_GB}) `];
    }
    if (obj.where.CARDNO) {
      WH = [...WH, ` MEDI_GOODS LIKE '%${obj.where.CARDNO}%' `];
    }
    if (obj.where.OVSEA_CARD) {
      if (obj.where.OVSEA_CARD === 'Y') {
        WH = [...WH, ` ISS_CD IN ('09') `];
      } else {
        WH = [...WH, ` ISS_CD NOT IN ('09') `];
      }
    }
    if (obj.where.CHECK_CARD) {
      if (obj.where.CHECK_CARD === 'Y') {
        WH = [...WH, ` CHECK_CARD = 'Y' `];
      } else {
        WH = [...WH, ` CHECK_CARD = 'N' `];
      }
    }
    if (!common.isEmptyArr(WH)) {
      ADDWHERE = ` AND ${WH.join(' AND ')} `;
    }

    let SET_WHERE = `WHERE SVCGB IN ('CC', 'CE') AND ADD_GB IN ('1', '2', '3', 'O', 'I', 'E', 'C', 'G', 'K') AND AUTHCD='0000' AND TID IN (SELECT TID FROM TB_BAS_TIDMAP ${USER_AUTH})  ${ADDWHERE}`;

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
      TOTCNT,
      TOTAMT,
      ACNT, 
      AAMT,
      CCNT, 
      CAMT
    FROM(
      SELECT
        SUM(ACNT) + SUM(CCNT) AS TOTCNT,
        SUM(AAMT) - SUM(CAMT) AS TOTAMT,
        SUM(ACNT) AS ACNT, 
        SUM(AAMT) AS AAMT,
        SUM(CCNT) AS CCNT, 
        SUM(CAMT) AS CAMT
      FROM(
        SELECT
          CASE WHEN APPGB='A' THEN COUNT(1) ELSE 0 END ACNT,
          CASE WHEN APPGB='A' THEN SUM(AMOUNT) ELSE 0 END AAMT,
          CASE WHEN APPGB='C' THEN COUNT(1) ELSE 0 END CCNT,
          CASE WHEN APPGB='C' THEN SUM(AMOUNT) ELSE 0 END CAMT
        FROM 
          ${obj.uInfo[5]}
          ${SET_WHERE}
        GROUP BY APPGB
      )
    )T1
    `

    let debugQuery = require('bind-sql-string').queryBindToString(query, [], { quoteEscaper: "''" });
    common.logger('info', `query debug => ${debugQuery}`);

    result = await connection.execute(query, [], options);

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