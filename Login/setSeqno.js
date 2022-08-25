const config = require('$Common/config');
const common = require('$Common/common');

async function run(oracledb, obj, res) {
  let connection;
  let userId = obj.userId;
  //let userPw = obj.userPw;
  let userPw = Buffer.from(obj.userPw, "base64").toString('utf8');
  let rstMsg = new Array();

  try {
    connection = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: config.connectString
    });
    oracledb.autoCommit = true;

    let binds = {
      ndate: common.nowDate.fullDate()
    };
    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };


    result = await connection.execute(
      `
      SELECT
        SEQ_NO
      FROM TB_SEQ_MST
        WHERE SEQ_DATE = :ndate AND SEQ_TYPE = 'LOG'
      `
      , binds, options);
    let rst = result.rows;
    if (rst[0]) {
        result = await connection.execute(
            `
            UPDATE INTO TB_SEQ_MST SET SEQ_NO = SEQ_NO + 1 
            WHERE SEQ_DATE = :ndate AND SEQ_TYPE = 'LOG'
            `
            , binds, options);
            let rst = result.rowsAffected;
            console.log("Row Update : ",rst);
    } else {
        result = await connection.execute(
            `
            INSERT INTO TB_SEQ_MST (SEQ_DATE, SEQ_TYPE, SEQ_NO) VALUES (:ndate,'LOG','1')
            `
            , binds, options);
            let rst = result.rowsAffected;
            console.log("Row Insert : ",rst);
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

