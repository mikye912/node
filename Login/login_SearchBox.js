const config = require('$Common/config');

async function run(oracledb, obj) {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: config.connectString
    });
    oracledb.autoCommit = true;

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };
    
    let query = `
    SELECT 
      PAGE,
      NAME, 
      FIELD, 
      TYPE, 
      DEFAULT_YN, 
      SORT
    FROM TB_BAS_SEARCHBOX_NEW
    WHERE ORG_CD = :orgcd
    ORDER BY PAGE ASC, DEFAULT_YN DESC, SORT ASC
    `
    result = await connection.execute(query, {orgCd : obj.MEMBER_ORG}, options);
    
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

