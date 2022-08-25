const config = require('$Common/config');
const common = require('$Common/common');

async function run(oracledb, obj) {
  let connection;

  let nowDate = common.nowDate.fullDate();
  let seqno = 0;
  let nowTime = `${common.nowDate.hours()}${common.nowDate.minutes()}${common.nowDate.seconds()}`;

  try {
    connection = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: config.connectString
    });
    oracledb.autoCommit = true;

    let binds = {
      SEQ_DATE: nowDate,
    };
    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };


    result = await connection.execute(
      `
      SELECT
        SEQ_NO
      FROM TB_SEQ_MST
        WHERE SEQ_DATE = :SEQ_DATE AND SEQ_TYPE = 'LOG'
      `
      , binds, options);
    let rst = result.rows;
    if (rst[0]) {
      seqno = rst[0].SEQ_NO;
      result = await connection.execute(
        `
            UPDATE TB_SEQ_MST SET SEQ_NO = SEQ_NO + 1 
            WHERE SEQ_DATE = :SEQ_DATE AND SEQ_TYPE = 'LOG'
            `
        , binds, options);
      let rst2 = result.rowsAffected;
      console.log("Row Update : ", rst2);
    } else {
      result = await connection.execute(
        `
            INSERT INTO TB_SEQ_MST (SEQ_DATE, SEQ_TYPE, SEQ_NO) VALUES (:SEQ_DATE,'LOG','1')
            `
        , binds, options);
      let rst3 = result.rowsAffected;
      console.log("Row Insert : ", rst3);
    }

    let binds2 = {
      LOG_DD: nowDate,
      LOG_TM: nowTime,
      LOG_SEQ: `${nowDate}${(seqno+1).toString().padStart(8, "0")}`,
      LOG_CONT: `USER LOGIN : ${obj.userId} ${nowDate} ${nowTime} 로그인.`,
      LOG_USER: obj.userId
    }
    result = await connection.execute(
      `
      INSERT INTO TB_SYS_LOG (LOG_DD, LOG_TM, LOG_SEQ, LOG_TYPE, LOG_PAGE, LOG_CONT, LOG_USER) 
      VALUES (:LOG_DD, :LOG_TM, :LOG_SEQ, 'L', '',:LOG_CONT, :LOG_USER)
      `
      , binds2, options);
    let rst4 = result.rowsAffected;
    console.log("Row Insert : ", rst4);
  } catch (err) {
    return err;
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

