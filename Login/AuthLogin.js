const dbConfig = require('$Common/dbconfig');

async function run(oracledb, obj, res) {
  let connection;
  let userId = obj.userId;
  //let userPw = obj.userPw;
  let userPw = Buffer.from(obj.userPw, "base64").toString('utf8');
  let rstMsg = new Array();
  let userAuthTXT = [{
    MEMBER_LOGIN_SESSION: userId,
    MEMBER_ORG: "",
    MEMBER_DEPO: "",
    MKTIME: new Date().getTime() / 1000,
    PTAB: "",
    VTAB: "",
    DTAB: "",
    USER_LV: "",
    AUTH_SEQ: "",
    TRANS_NO: ""
  }]

  try {
    connection = await oracledb.getConnection({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString
    });
    oracledb.autoCommit = true;

    let binds = {
      userId: userId
    };
    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    result = await connection.execute(
      `
      SELECT 
        T1.ORG_CD,
        T1.AUTH_SEQ,
        T1.USER_ID,
        T1.USER_PW,
        T1.USER_NM,
        T1. USER_TEL1,
        T1.USER_TEL2,
        T1.USE_CHK,
        T1.DEP_CD,
        T1.USER_LV,
        T1.AUTH_QRY01,
        T1.AUTH_QRY02,
        T1.AUTH_QRY03,
        T1.AUTH_QRY04,
        T1.TRANS_NO,
        T2.ORG_NM,
        T2.ORG_NO,
        T2.ORG_ADDR,
        T2.ORG_TEL1,
        T2.ORG_TEL2,
        T2.ORG_USER,
        T2.PTAB,
        T2.VTAB,
        T2.DTAB,
        T2.CTAB
      FROM TB_BAS_USER T1
      LEFT OUTER JOIN( SELECT * FROM TB_BAS_ORG )T2 ON(T1.ORG_CD=T2.ORG_CD)
      WHERE USER_ID=:userId
      `
      , binds, options);
    let rst = result.rows;
    if (rst[0]) {
      if (rst[0].USE_CHK == "9") {
        throw {errMsg: '계정이 잠겼습니다. 관리자에게 문의주세요.'};
      } else if (rst[0].USER_PW != userPw) {
        result = await connection.execute(
          `
              UPDATE TB_BAS_USER SET 
                USE_CHK= (
                          SELECT 
                            NVL(USE_CHK, 0) 
                            FROM TB_BAS_USER 
                          WHERE USER_ID=:userId
                          ) +1 
              WHERE USER_ID=:userId
              `
          , binds, options);

        let rst = result.rowsAffected;
        console.log('Rows Insert : ' + rst);
        throw {errMsg: '비밀번호를 확인하여 주십시오.'};
      }else{
        let jsonObj = new Object();

        jsonObj.MEMBER_LOGIN_SESSION = rst[0].USER_ID;
        jsonObj.MEMBER_ORG = rst[0].ORG_CD;
        jsonObj.MEMBER_DEPO = rst[0].DEP_CD;
        jsonObj.MKTIME = new Date().getTime() / 1000,
        jsonObj.PTAB = rst[0].PTAB;
        jsonObj.VTAB = rst[0].VTAB;
        jsonObj.DTAB = rst[0].DTAB;
        jsonObj.USER_LV = rst[0].USER_LV;
        jsonObj.AUTH_SEQ = rst[0].AUTH_SEQ;
        jsonObj.TRANS_NO = rst[0].TRANS_NO;
        rstMsg.push(jsonObj);
      }
    } else {
      throw {errMsg: '아이디를 확인하여 주십시오.'};
    }
      return rstMsg;
    //let userEnc = Buffer.from(userTXT, "utf8").toString('base64');
    //console.log(userEnc);
  } catch (err) {
    return err;
    //res.send(err);
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

