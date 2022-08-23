const config = require('$Common/config');

async function run(oracledb, obj) {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: config.connectString
    });

    let binds = {
        orgcd : obj.uInfo[1],
      };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };
    let query = `
    SELECT
        DEP_NM
        ,TERM_ID
        ,TERM_NM
        ,ACNT
        ,CCNT
        ,AAMT
        ,CAMT
        ,TOTCNT
        ,TOTAMT
        ,BC
        ,NH
        ,KB
        ,SS
        ,HN
        ,LO
        ,HD
        ,SI
    FROM(    
        SELECT
            TID
            ,SUM(ACNT) ACNT
            ,SUM(CCNT) CCNT
            ,SUM(AAMT) AAMT
            ,SUM(CAMT) CAMT
            ,SUM(ACNT)+SUM(CCNT) TOTCNT
            ,SUM(AAMT)-SUM(CAMT) TOTAMT
            ,SUM(ABC  )-SUM(CBC  ) BC
            ,SUM(ANH  )-SUM(CNH  ) NH
            ,SUM(AKB  )-SUM(CKB  ) KB
            ,SUM(ASS  )-SUM(CSS  ) SS
            ,SUM(AHN  )-SUM(CHN  ) HN
            ,SUM(ALO  )-SUM(CLO  ) LO
            ,SUM(AHD  )-SUM(CHD  ) HD
            ,SUM(ASI  )-SUM(CSI  ) SI
        FROM(    
            SELECT
                TID
                ,CASE WHEN APPGB='A' THEN COUNT(1) ELSE 0 END ACNT
                ,CASE WHEN APPGB='C' THEN COUNT(1) ELSE 0 END CCNT
                ,CASE WHEN APPGB='A' THEN SUM(AMOUNT) ELSE 0 END AAMT
                ,CASE WHEN APPGB='C' THEN SUM(AMOUNT) ELSE 0 END CAMT
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0006', '026', '01') THEN SUM(AMOUNT) ELSE 0 END ABC
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0030', '018', '11') THEN SUM(AMOUNT) ELSE 0 END ANH
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0001', '016', '02') THEN SUM(AMOUNT) ELSE 0 END AKB
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0004', '031', '06') THEN SUM(AMOUNT) ELSE 0 END ASS
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0005', '008', '03') THEN SUM(AMOUNT) ELSE 0 END AHN
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0003', '047', '33') THEN SUM(AMOUNT) ELSE 0 END ALO
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0002', '027', '08') THEN SUM(AMOUNT) ELSE 0 END AHD
                ,CASE WHEN APPGB='A' AND ACQ_CD IN ('VC0007', '029', '07') THEN SUM(AMOUNT) ELSE 0 END ASI
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0006', '026', '01') THEN SUM(AMOUNT) ELSE 0 END CBC
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0030', '018', '11') THEN SUM(AMOUNT) ELSE 0 END CNH
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0001', '016', '02') THEN SUM(AMOUNT) ELSE 0 END CKB
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0004', '031', '06') THEN SUM(AMOUNT) ELSE 0 END CSS
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0005', '008', '03') THEN SUM(AMOUNT) ELSE 0 END CHN
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0003', '047', '33') THEN SUM(AMOUNT) ELSE 0 END CLO
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0002', '027', '08') THEN SUM(AMOUNT) ELSE 0 END CHD
                ,CASE WHEN APPGB='C' AND ACQ_CD IN ('VC0007', '029', '07') THEN SUM(AMOUNT) ELSE 0 END CSI
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
                LEFT OUTER JOIN( SELECT DEP_CD, TERM_NM, TERM_ID FROM TB_BAS_TIDMST WHERE ORG_CD=:orgcd)T3 ON(T1.TID=T3.TERM_ID)
                LEFT OUTER JOIN( SELECT DEP_NM, DEP_CD FROM TB_BAS_DEPART WHERE ORG_CD=:orgcd)T4 ON(T3.DEP_CD=T4.DEP_CD)
                LEFT OUTER JOIN( SELECT PUR_NM, PUR_OCD, PUR_KOCES, PUR_KIS FROM TB_BAS_PURINFO)T5 ON (T1.ACQ_CD=T5.PUR_OCD OR T1.ACQ_CD=T5.PUR_KOCES OR T1.ACQ_CD=T5.PUR_KIS)
                WHERE SVCGB IN ('CC', 'CE') AND AUTHCD='0000' AND TID IN (SELECT TID FROM TB_BAS_TIDMAP  WHERE ORG_CD=:orgcd)   AND T1.APPDD>='20220823' AND T1.APPDD<='20220823'
                ORDER BY APPDD DESC, APPTM DESC
                )
            )
        )
        GROUP BY TID, APPGB, ACQ_CD
        )
        GROUP BY TID        
    )T2
    LEFT OUTER JOIN( SELECT DEP_CD, TERM_NM, TERM_ID FROM TB_BAS_TIDMST WHERE ORG_CD=:orgcd)T3 ON(T2.TID=T3.TERM_ID)
    LEFT OUTER JOIN( SELECT DEP_NM, DEP_CD FROM TB_BAS_DEPART WHERE ORG_CD=:orgcd)T4 ON(T3.DEP_CD=T4.DEP_CD)
    `
    result = await connection.execute(query, binds, options);
    
    let rst = result.rows;
    console.log(rst)
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

