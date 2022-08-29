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
    // TODO 쿼리에 지역화폐, 카카오페이 추가하기
    let query = `
    SELECT
        --DEP_NM
        --,TERM_ID
		    ROWNUM
        ,TERM_NM
        ,TOTCNT
        ,TOTAMT
        ,ACNT
        ,AAMT
        ,CCNT
        ,CAMT
        ,KB
        ,NH
        ,LO
        ,BC
        ,SS
        ,SI
        ,HN
        ,HD
        ,RP
        ,AP
        ,WP
        ,ZP
        ,KP
    FROM(    
        SELECT
            TID
            ,SUM(ACNT)+SUM(CCNT) TOTCNT
            ,SUM(AAMT)-SUM(CAMT) TOTAMT
            ,SUM(ACNT) ACNT
            ,SUM(AAMT) AAMT
            ,SUM(CCNT) CCNT
            ,SUM(CAMT) CAMT
            ,SUM(AKB)-SUM(CKB) KB
            ,SUM(ANH)-SUM(CNH) NH
            ,SUM(ALO)-SUM(CLO) LO
            ,SUM(ABC)-SUM(CBC) BC
            ,SUM(ASS)-SUM(CSS) SS
            ,SUM(ASI)-SUM(CSI) SI
            ,SUM(AHN)-SUM(CHN) HN
            ,SUM(AHD)-SUM(CHD) HD
            ,SUM(ARP)-SUM(CRP) RP
            ,SUM(AAP)-SUM(CAP) AP
            ,SUM(AWP)-SUM(CWP) WP
            ,SUM(AZP)-SUM(CZP) ZP
            ,SUM(AKP)-SUM(CKP) KP
        FROM(    
            SELECT
                TID
                ,CASE WHEN APPGB='A' THEN COUNT(1) ELSE 0 END ACNT
                ,CASE WHEN APPGB='A' THEN SUM(AMOUNT) ELSE 0 END AAMT
                ,CASE WHEN APPGB='C' THEN COUNT(1) ELSE 0 END CCNT
                ,CASE WHEN APPGB='C' THEN SUM(AMOUNT) ELSE 0 END CAMT
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0001', '016', '02') THEN SUM(AMOUNT) ELSE 0 END AKB
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0001', '016', '02') THEN SUM(AMOUNT) ELSE 0 END CKB
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0030', '018', '11') THEN SUM(AMOUNT) ELSE 0 END ANH
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0030', '018', '11') THEN SUM(AMOUNT) ELSE 0 END CNH
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0003', '047', '33') THEN SUM(AMOUNT) ELSE 0 END ALO
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0003', '047', '33') THEN SUM(AMOUNT) ELSE 0 END CLO
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0006', '026', '01') THEN SUM(AMOUNT) ELSE 0 END ABC
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0006', '026', '01') THEN SUM(AMOUNT) ELSE 0 END CBC
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0004', '031', '06') THEN SUM(AMOUNT) ELSE 0 END ASS
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0004', '031', '06') THEN SUM(AMOUNT) ELSE 0 END CSS
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0007', '029', '07') THEN SUM(AMOUNT) ELSE 0 END ASI
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0007', '029', '07') THEN SUM(AMOUNT) ELSE 0 END CSI
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0005', '008', '03') THEN SUM(AMOUNT) ELSE 0 END AHN
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0005', '008', '03') THEN SUM(AMOUNT) ELSE 0 END CHN
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0002', '027', '08') THEN SUM(AMOUNT) ELSE 0 END AHD
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0002', '027', '08') THEN SUM(AMOUNT) ELSE 0 END CHD
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('', '', '') THEN SUM(AMOUNT) ELSE 0 END ARP
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('', '', '') THEN SUM(AMOUNT) ELSE 0 END CRP
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0010', '0003') THEN SUM(AMOUNT) ELSE 0 END AAP
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0010', '0003') THEN SUM(AMOUNT) ELSE 0 END CAP
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0012', '0009') THEN SUM(AMOUNT) ELSE 0 END AWP
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0012', '0009') THEN SUM(AMOUNT) ELSE 0 END CWP
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0083', '9999') THEN SUM(AMOUNT) ELSE 0 END AZP
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0083', '9999') THEN SUM(AMOUNT) ELSE 0 END CZP
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('', '', '') THEN SUM(AMOUNT) ELSE 0 END AKP
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('', '', '') THEN SUM(AMOUNT) ELSE 0 END CKP
            FROM (
                SELECT
                SEQNO, DEP_NM, TERM_NM, TID, MID, PUR_NM, ACQ_CD, 
                AUTHSTAT, APPDD, APPTM, OAPPDD, APPNO, APPGB,
                APPGB_TXT, CARDNO,   AMOUNT,   HALBU, CARDTP_TXT, SIGNCHK_TXT,
                AUTHCD,   EXT_FIELD,   TRANIDX, AUTHMSG
            FROM(
                SELECT
                SEQNO, DEP_NM, TERM_NM, TID, MID, PUR_NM, 
                CASE
                    WHEN APPGB='A' AND OAPP_AMT IS NULL THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0011') 
                    WHEN APPGB='A' AND OAPP_AMT = APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0012')
                    WHEN APPGB='A' AND OAPP_AMT <> APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0013')
                    WHEN APPGB='C' AND OAPPDD = APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0012') 
                    WHEN APPGB='C' AND OAPPDD <> APPDD THEN (SELECT SCD_DIP FROM TB_BAS_SITECODE WHERE ORG_CD=:orgcd AND SCD_CD='SCD0013') 
                END AUTHSTAT,
                APPDD, APPTM, OAPPDD, APPNO, APPGB, ACQ_CD,
                CASE 
                    WHEN APPGB='A' THEN '신용승인'
                    WHEN APPGB='C' THEN '신용취소'
                END APPGB_TXT,
                CARDNO,   AMOUNT,   HALBU,
                CASE WHEN CHECK_CARD='Y' THEN '체크카드' ELSE '신용카드' END CARDTP_TXT,
                CASE WHEN SIGNCHK='1' THEN '전자서명' ELSE '무서명' END SIGNCHK_TXT,
                AUTHCD, EXT_FIELD,   TRANIDX, AUTHMSG
                FROM(
                SELECT
                    SEQNO, BIZNO, TID, MID, VANGB, MDATE, SVCGB, T1.TRANIDX, T1.APPGB, ENTRYMD,
                    T1.APPDD, APPTM, T1.APPNO, T1.CARDNO, HALBU, CURRENCY, T1.AMOUNT, AMT_UNIT, AMT_TIP, AMT_TAX,
                    ISS_CD, ISS_NM, ACQ_CD, ACQ_NM, AUTHCD, AUTHMSG, CARD_CODE, CHECK_CARD, OVSEA_CARD, TLINEGB,
                    SIGNCHK, DDCGB, EXT_FIELD, OAPPNO, OAPPDD, OAPPTM, OAPP_AMT, ADD_GB, ADD_CID, ADD_CD,
                    ADD_RECP, ADD_CNT, ADD_CASHER, ADD_DATE, SECTION_NO, PUR_NM, DEP_NM, TERM_NM 
                FROM
                    ${obj.uInfo[5]} T1  
                LEFT OUTER JOIN( SELECT DEP_CD, TERM_NM, TERM_ID FROM TB_BAS_TIDMST ${ORG_WH})T3 ON(T1.TID=T3.TERM_ID)
                LEFT OUTER JOIN( SELECT DEP_NM, DEP_CD FROM TB_BAS_DEPART ${ORG_WH})T4 ON(T3.DEP_CD=T4.DEP_CD)
                LEFT OUTER JOIN( SELECT PUR_NM, PUR_OCD, PUR_KOCES, PUR_KIS FROM TB_BAS_PURINFO)T5 ON (T1.ACQ_CD=T5.PUR_OCD OR T1.ACQ_CD=T5.PUR_KOCES OR T1.ACQ_CD=T5.PUR_KIS)
                ${SET_WHERE}
                ORDER BY APPDD DESC, APPTM DESC
                )
            )
          ${EXTRA_WHERE}
        )
        GROUP BY TID, APPGB, ACQ_CD
        )
        GROUP BY TID        
    )T2
    LEFT OUTER JOIN( SELECT DEP_CD, TERM_NM, TERM_ID FROM TB_BAS_TIDMST ${ORG_WH})T3 ON(T2.TID=T3.TERM_ID)
    LEFT OUTER JOIN( SELECT DEP_NM, DEP_CD FROM TB_BAS_DEPART ${ORG_WH})T4 ON(T3.DEP_CD=T4.DEP_CD)
    `
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