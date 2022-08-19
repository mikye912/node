const config = require('$Common/config');

async function run(oracledb, obj) {
  let connection;

  let whDepCd = obj.MEMBER_DEPO ? ` AND DEP_CD = '${obj.MEMBER_DEPO}' ` : ``;

  try {
    connection = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: config.connectString
    });
    oracledb.autoCommit = true;

    let binds = {
      orgCd : obj.uInfo[1],
    };

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };
    let query = `
    SELECT DEP_NM AS NAME, DEP_CD AS VALUE FROM TB_BAS_DEPART WHERE ORG_CD=:orgCd ${whDepCd}
    `
    result = await connection.execute(query, binds, options);
    
    let rst = result.rows;
    
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

