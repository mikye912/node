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
        WH = [...WH, ` T1.CHECK_CARD = 'Y' `];
      } else {
        WH = [...WH, ` T1.CHECK_CARD = 'N' `];
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
      APPDD
      ,ADD_CASHER
      ,KBCNT
      ,KBAMT
      ,NHCNT
      ,NHAMT
      ,LOCNT
      ,LOAMT
      ,BCCNT
      ,BCAMT
      ,SSCNT
      ,SSAMT
      ,SICNT
      ,SIAMT
      ,HNCNT
      ,HNAMT
      ,HDCNT
      ,HDAMT
      ,RPCNT
      ,RPAMT
      ,APCNT
      ,APAMT
      ,WPCNT
      ,WPAMT
      ,ZPCNT
      ,ZPAMT
      ,KPCNT
      ,KPAMT
    FROM
    (
    SELECT
      APPDD
      ,CASE 
          WHEN GROUPING(APPDD) = 1 AND GROUPING(ADD_CASHER) = 1 THEN '합계'
          WHEN GROUPING(APPDD) = 0 AND GROUPING(ADD_CASHER) = 1 THEN '소계' ELSE ADD_CASHER
        END ADD_CASHER
        ,GROUPING(APPDD) AS GR_APPDD
        ,GROUPING(ADD_CASHER) AS GR_ADD_CASHER
      ,SUM(KB_CNT) KBCNT
      ,SUM(AKB)-SUM(CKB) KBAMT
      ,SUM(NH_CNT) NHCNT
      ,SUM(ANH)-SUM(CNH) NHAMT
      ,SUM(LO_CNT) LOCNT
      ,SUM(ALO)-SUM(CLO) LOAMT
      ,SUM(BC_CNT) BCCNT
      ,SUM(ABC)-SUM(CBC) BCAMT
      ,SUM(SS_CNT) SSCNT
      ,SUM(ASS)-SUM(CSS) SSAMT
      ,SUM(SI_CNT) SICNT
      ,SUM(ASI)-SUM(CSI) SIAMT
      ,SUM(HN_CNT) HNCNT
      ,SUM(AHN)-SUM(CHN) HNAMT
      ,SUM(HD_CNT) HDCNT
      ,SUM(AHD)-SUM(CHD) HDAMT
      ,SUM(RP_CNT) RPCNT
      ,SUM(ARP)-SUM(CRP) RPAMT
      ,SUM(AP_CNT) APCNT
      ,SUM(AAP)-SUM(CAP) APAMT
      ,SUM(WP_CNT) WPCNT
      ,SUM(AWP)-SUM(CWP) WPAMT
      ,SUM(ZP_CNT) ZPCNT
      ,SUM(AZP)-SUM(CZP) ZPAMT
      ,SUM(KP_CNT) KPCNT
      ,SUM(AKP)-SUM(CKP) KPAMT
    FROM(
      SELECT 
        ADD_CASHER
        ,APPDD
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
        ,CASE WHEN ACQ_CD IN ('VC0006', '026', '01') THEN COUNT(1) ELSE 0 END BC_CNT
        ,CASE WHEN ACQ_CD IN ('VC0030', '018', '11') THEN COUNT(1) ELSE 0 END NH_CNT
        ,CASE WHEN ACQ_CD IN ('VC0001', '016', '02') THEN COUNT(1) ELSE 0 END KB_CNT
        ,CASE WHEN ACQ_CD IN ('VC0004', '031', '06') THEN COUNT(1) ELSE 0 END SS_CNT
        ,CASE WHEN ACQ_CD IN ('VC0005', '008', '03') THEN COUNT(1) ELSE 0 END HN_CNT
        ,CASE WHEN ACQ_CD IN ('VC0003', '047', '33') THEN COUNT(1) ELSE 0 END LO_CNT
        ,CASE WHEN ACQ_CD IN ('VC0002', '027', '08') THEN COUNT(1) ELSE 0 END HD_CNT
        ,CASE WHEN ACQ_CD IN ('0029', '07') THEN COUNT(1) ELSE 0 END SI_CNT
        ,CASE WHEN ACQ_CD IN ('', '', '') THEN COUNT(1) ELSE 0 END RP_CNT
        ,CASE WHEN ACQ_CD IN ('VC0010', '0003') THEN COUNT(1) ELSE 0 END AP_CNT
        ,CASE WHEN ACQ_CD IN ('VC0012', '0009') THEN COUNT(1) ELSE 0 END WP_CNT
        ,CASE WHEN ACQ_CD IN ('VC0083', '9999') THEN COUNT(1) ELSE 0 END ZP_CNT
        ,CASE WHEN ACQ_CD IN ('', '', '') THEN COUNT(1) ELSE 0 END KP_CNT
      FROM 
        ${obj.uInfo[5]}
      ${SET_WHERE}
      GROUP BY APPGB, APPDD, ADD_CASHER, ACQ_CD
    )
    GROUP BY ROLLUP(APPDD, ADD_CASHER)
    )
    ORDER BY GR_APPDD DESC, APPDD, GR_ADD_CASHER ASC
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