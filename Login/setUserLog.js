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

    let query = `
    SELECT
      SEQ_NO
    FROM TB_SEQ_MST
      WHERE SEQ_DATE = :SEQ_DATE AND SEQ_TYPE = 'LOG'
    `

    let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
    common.logger('info', `query debug => ${debugQuery}`);

    result = await connection.execute(query, binds, options);
    let rst = result.rows;
    if (rst[0]) {
      seqno = rst[0].SEQ_NO;
      query = `
      UPDATE TB_SEQ_MST SET SEQ_NO = SEQ_NO + 1 
      WHERE SEQ_DATE = :SEQ_DATE AND SEQ_TYPE = 'LOG'
      `

      let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
      common.logger('info', `query debug => ${debugQuery}`);

      result = await connection.execute(query, binds, options);
      let rst2 = result.rowsAffected;
      //console.log("Row Update : ", rst2);
    } else {
      query = `
      INSERT INTO TB_SEQ_MST (SEQ_DATE, SEQ_TYPE, SEQ_NO) VALUES (:SEQ_DATE,'LOG','1')
      `

      let debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
      common.logger('info', `query debug => ${debugQuery}`);

      result = await connection.execute(query, binds, options);
      let rst3 = result.rowsAffected;
      //console.log("Row Insert : ", rst3);
    }

    let binds2 = {
      LOG_DD: nowDate,
      LOG_TM: nowTime,
      LOG_SEQ: `${nowDate}${(seqno+1).toString().padStart(8, "0")}`,
      LOG_CONT: `USER LOGIN : ${obj.userId} ${nowDate} ${nowTime} 로그인.`,
      LOG_USER: obj.userId
    }

    query = `
    INSERT INTO TB_SYS_LOG (LOG_DD, LOG_TM, LOG_SEQ, LOG_TYPE, LOG_PAGE, LOG_CONT, LOG_USER) 
    VALUES (:LOG_DD, :LOG_TM, :LOG_SEQ, 'L', '',:LOG_CONT, :LOG_USER)
    `

    debugQuery = require('bind-sql-string').queryBindToString(query, binds, { quoteEscaper: "''" });
    common.logger('info', `query debug => ${debugQuery}`);

    result = await connection.execute(query, binds2, options);
    let rst4 = result.rowsAffected;
    //console.log("Row Insert : ", rst4);
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

