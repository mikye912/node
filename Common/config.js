module.exports = {
    port          : 5000,
    secret        : "Gaon1309!",
    user          : process.env.NODE_ORACLEDB_USER || "IFOU",
    password      : process.env.NODE_ORACLEDB_PASSWORD || "1",
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "175.207.12.32/ORCL",
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
};