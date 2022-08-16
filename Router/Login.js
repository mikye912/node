const common = require('$Common/common');
const dbconn = require('$Common/dbconn');
const express = require('express');
const router = express.Router();

router.post('/AuthLogin', (req, res) => {
    let Obj = new Object();
    const jsonObj = req.body;
    const secret = req.app.get('jwt_secret');
    async function userINFO() {
        try { 
            const getUinfo = await dbconn.getData('$Login/AuthLogin',jsonObj, res);

            let key = Object.keys(getUinfo)[0];
            if (key == "errMsg") {
                throw getUinfo.errMsg;
            }
            let arr = new Array();
            arr = [...arr, dbconn.createPromise('$Login/login_UserMenu',getUinfo[0])];
            arr = [...arr, dbconn.createPromise('$Login/login_SearchBox',getUinfo[0])];
            arr = [...arr, dbconn.createPromise('$Login/login_UserDepart',getUinfo[0])];
            arr = [...arr, dbconn.createPromise('$Login/login_UserTid',getUinfo[0])];
            arr = [...arr, dbconn.createPromise('$Login/login_UserAcq')];

            await dbconn.getDataAll(arr).then((res) => {
                Obj.uInfo = common.uInfo_base64(getUinfo);
                Obj.uMenu = common.uMenu_base64(res[0]);
                Obj.uSearch = common.uSearch_base64(res[1], res[2], res[3], res[4]);
            });

            // 엑세스 토큰 발급
            const accessToken = common.signToken(
                {
                uInfo : Obj.uInfo
                }, 
                secret, 
                {
                    expiresIn: '7d',
                    subject: 'uInfo'
                }
            )

            await accessToken.then((res)=>Obj.token = res);

        } catch (err) {
            console.log(err);
            Obj.errMsg = err;
        }
        return Obj;
    }
    userINFO().then(res.send.bind(res));
});

module.exports = router;