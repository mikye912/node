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

    let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };
    let query = `
    SELECT 
      TITLE,
      NAME,
      VALUE
    FROM
    (
    SELECT 
      TERM_NM AS NAME,
      TERM_ID AS VALUE,
      DEP_CD
    FROM TB_BAS_TIDMST
    WHERE ORG_CD=:orgCd ${whDepCd}
    ORDER BY TERM_SORT ASC
    ) T1
    LEFT OUTER JOIN (
      SELECT DEP_NM AS TITLE, DEP_CD FROM TB_BAS_DEPART WHERE ORG_CD=:orgCd ${whDepCd}
    ) T2 ON(T1.DEP_CD = T2.DEP_CD)
    ORDER BY TITLE ASC
    `
    

    // `
    //   SELECT 
    //     TERM_NM AS NAME,
    //     TERM_ID AS VALUE
    //   FROM TB_BAS_TIDMST 
    //   WHERE ORG_CD=:orgCd AND TERM_ID IN ( 
    //     SELECT 
    //       TID 
    //     FROM TB_BAS_TIDMAP 
    //       WHERE ORG_CD=:orgCd ${whDepCd}
    //     ) 
    //   ORDER BY TERM_SORT ASC
    // `


    result = await connection.execute(query, {orgCd : obj.MEMBER_ORG}, options);
    
    let rst = result.rows;
    console.log(rst);
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

