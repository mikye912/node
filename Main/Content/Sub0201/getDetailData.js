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
    //   let where = {
    //     "APPNO": "22074616",
    //     "ADD_CID": "3570526",
    //     "ADD_CASHER": "K032",
    //     "SAMOUNT": "0",
    //     "EAMOUNT": "1300",
    //     "CARDNO": "12345678901234",
    //     "MID": "72209332",
    //     "ADD_CD": "FC",
    //     "ADD_GB": "O",
    //     "SDATE": "20220823",
    //     "EDATE": "20220823",
    //     "ACQ_CD": "VC0030,12",
    //     "CHECK_CARD": "Y",
    //     "OVSEA_CARD": "N",
    //     "DEP_CD": [
    //         "MD1599704551",
    //         "MD1603168055"
    //     ],
    //     "TID": [
    //         "0370000",
    //         "8102004001",
    //         "8102013001"
    //     ],
    //     "APPGB": [
    //         "A"
    //     ],
    //     "AUTHSTAT": [
    //         "정상거래"
    //     ]
    // }

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

    //console.log("SET_WHERE : ",SET_WHERE);
    //console.log("EXTRA_WHERE : ",EXTRA_WHERE);

    let binds = {
      orgcd: obj.uInfo[1],
    };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };
    let query = `
    SELECT 	
        SEQNO,
        TID,
        MID,
        VANGB,
        MDATE,
        TRANIDX,
        CASE 
          WHEN APPGB = 'A' THEN '신용승인' 
          WHEN APPGB = 'C' THEN '신용취소' 
          ELSE APPGB 
        END APPGB,
        AUTHSTAT,
        ENTRYMD,
        APPDD,
        APPTM,
        APPNO,
        CARDNO,
        HALBU,
        AMOUNT,
        ACQ_CD,
        PUR_NM,
        AUTHCD,
        CHECK_CARD,
        OVSEA_CARD,
        TLINEGB,
        SIGNCHK,
        OAPPNO,
        OAPPDD,
        ISS_CD,
        ADD_GB,
        ADD_CID,
        ADD_CD,
        ADD_RECP,
        ADD_CASHER,
        DEP_NM,
        EXP_DD,
        REG_DD,
        CASE 
          WHEN RTN_CD IN ('60','67') THEN '정상매입' 
          WHEN RTN_CD IN ('61','64') THEN '매입반송' 
          WHEN RTN_CD IS NULL THEN '결과없음' 
          ELSE RTN_CD 
        END RTN_CD,
        TERM_NM,
        DEPO_DD,
        OAPP_AMT,
        DDCGB,
        MEDI_GOODS
    FROM ( 
        SELECT
            SEQNO
            , TID
            , MID
            , VANGB
            , MDATE
            , T1.TRANIDX
            , T1.APPGB
            , CASE 
                WHEN T1.APPGB='A' AND T1.OAPP_AMT IS NULL THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0011') 
                WHEN T1.APPGB='A' AND T1.OAPP_AMT=T1.APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0012')
                WHEN T1.APPGB='A' AND T1.OAPP_AMT<>T1.APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0013')
                WHEN T1.APPGB='C' AND T1.OAPPDD = T1.APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0012') 
                WHEN T1.APPGB='C' AND T1.OAPPDD <> T1.APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0013') 
            END AUTHSTAT 
            , ENTRYMD
            , T1.APPDD
            , APPTM
            , T1.APPNO
            , T1.CARDNO
            , HALBU
            , T1.AMOUNT
            , ACQ_CD
            , PUR_NM
            , AUTHCD
            , CASE 
                WHEN CHECK_CARD='Y' THEN '체크카드' 
                WHEN CHECK_CARD='N' THEN '신용카드' 
                ELSE ''
            END CHECK_CARD
            , OVSEA_CARD
            , TLINEGB
            , SIGNCHK
            , OAPPNO
            , OAPPDD
            , ISS_CD
            , CASE 
                WHEN ADD_GB IN ('1', 'O') THEN '외래' 
                WHEN ADD_GB IN ('2', 'E') THEN '응급' 
                WHEN ADD_GB IN ('3', 'I') THEN '입원' 
                WHEN ADD_GB IN ('4', 'G') THEN '종합검진' 
                WHEN ADD_GB='5' THEN '일반검진' 
                WHEN ADD_GB='6' THEN '장례식장' 
                ELSE ''
            END ADD_GB
            , ADD_CID, ADD_CD,
            ADD_RECP, ADD_CASHER, DEP_NM, EXP_DD, REG_DD, RTN_CD, TERM_NM,
            DEPOREQDD DEPO_DD, OAPP_AMT, DDCGB, MEDI_GOODS  
        FROM
            ${obj.uInfo[5]} T1
        LEFT OUTER JOIN(
            SELECT EXP_DD, REQ_DD, REG_DD, APP_DD, APP_NO, SALE_AMT, TRANIDX, RSC_CD, RTN_CD, CARD_NO, ORGCD FROM ${obj.uInfo[6]}
        )T2 ON(T1.APPDD=T2.APP_DD AND T1.MEDI_GOODS=T2.ORGCD AND T1.APPNO = T2.APP_NO AND T1.TRANIDX = T2.TRANIDX)
        LEFT OUTER JOIN( 
            SELECT DEP_CD, TERM_NM, TERM_ID FROM TB_BAS_TIDMST ${ORG_WH}
        )T3 ON(T1.TID=T3.TERM_ID)
        LEFT OUTER JOIN( 
            SELECT DEP_NM, DEP_CD FROM TB_BAS_DEPART ${ORG_WH}
        )T4 ON(T3.DEP_CD=T4.DEP_CD)
        LEFT OUTER JOIN( SELECT PUR_NM, PUR_OCD, PUR_KOCES, PUR_CD, PUR_KIS FROM TB_BAS_PURINFO)T5 ON (T1.ACQ_CD=T5.PUR_OCD OR T1.ACQ_CD=T5.PUR_KOCES OR T1.ACQ_CD=T5.PUR_CD OR T1.ACQ_CD=T5.PUR_KIS)
        ${SET_WHERE}
        ORDER BY APPDD ASC, APPTM ASC
        )
        ${EXTRA_WHERE}
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