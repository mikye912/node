const common = require('$Common/common');
const dbconn = require('$Common/dbconn');
const express = require('express');
const router = express.Router();
const net = require('net');

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
            const uInfo = common.uInfo_base64(getUinfo);

            // 엑세스 토큰 발급
            const accessToken = common.signToken(
                {
                uInfo : uInfo
                }, 
                secret, 
                {
                    expiresIn: '7d',
                    subject: 'uInfo'
                }
            )
            await accessToken
            .then((res) => {
                Obj.token = res;
                dbconn.getData('$Login/setUserLog',jsonObj);
            })
            .then(() => {
                //인증번호 생성
                return dbconn.getData('$Login/AuthSms',jsonObj);
            })
            .then((res) => {
                //인증번호 데몬 통신
                let obj = {};
                Object.assign(obj, { TRANS_NO : res.TRANS_NO }, res.data[0]);
                let trData = "";
                trData += "S101";
                trData += "1100";
                trData += common.nowDate.fullDate();
                trData += "".padStart(6, "0");
                trData += "".padStart(4, "0");
                trData += " ";
                trData += obj.USER_TEL2.padEnd(20, " ");
                trData += "0221872700".padEnd(20, " ");
                trData += "IFOU SMS 인증번호 ";
                trData += obj.TRANS_NO.toString().padEnd(82, " ");
                trData += "".padStart(20, " ");
                trData += "2000";
                trData += "1116";
                trData += obj.USER_ID.padEnd(12, " ");
                console.log(trData)
                const socket = net.connect({
                    port: '21150',
                    host: "192.168.0.174"
                });
                
                socket.setEncoding('utf-8');
                socket.on('connect', () => {
                    console.log('on connect');
                    
                    socket.write(trData);
                })
                socket.on('end', () => {
                    console.log('END')
                })
            })
            .catch(() => {throw "signToken Error"});
        } catch (err) {
            Obj.errMsg = err;
        }
        return Obj;
    }
    userINFO().then(res.send.bind(res));
});

module.exports = router;