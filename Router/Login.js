const common = require('$Common/common');
const dbconn = require('$Common/dbconn');
const socket = require('$Common/socket');
const express = require('express');
const router = express.Router();

router.route('/AuthLogin')
    .get((req, res) => {
        let Obj = new Object();
        const jsonObj = req.query;
        
        const getTransNo = async () => {
            const data = await dbconn.getData('$Login/AuthConfirm', jsonObj, res);
            if(data[0].TRANS_NO === jsonObj.transNo){
                Obj.result = true;
            }else{
                Obj.errMsg = "인증번호가 일치하지 않습니다.";
            }
            return Obj;
        }
        // ! 운영 반영 시 주석 해제
        // getTransNo()
        // .then(res.send.bind(res))
        // .catch((err) => {
        //     console.error(err)
        //     res.status(500).send(err.toString())
        // })
        res.send();
    })
    .post((req, res) => {
        let Obj = new Object();
        const jsonObj = req.body;
        const secret = req.app.get('jwt_secret');
        const userINFO = async () => {
            try {
                const getUinfo = await dbconn.getData('$Login/AuthLogin', jsonObj, res);

                let key = Object.keys(getUinfo)[0];
                if (key == "errMsg") {
                    throw getUinfo.errMsg;
                }
                const uInfo = common.uInfo_base64(getUinfo);

                // 엑세스 토큰 발급
                const accessToken = common.signToken(
                    {
                        uInfo: uInfo
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
                        dbconn.getData('$Login/setUserLog', jsonObj);
                    })
                    .then(() => {
                        //인증번호 생성
                        return dbconn.getData('$Login/AuthSms', jsonObj);
                    })
                    .then((res) => {
                        //인증번호 데몬 통신
                        let obj = {};
                        Object.assign(obj, { TRANS_NO: res.TRANS_NO }, res.data[0]);
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
                        console.log(trData);

                        const authSocket = socket.getConnection('authSocket', {
                            port: '5000',      // ! 차후 운영 반영시 변경
                            host: "localhost"  // ! 차후 운영 반영시 변경
                        })
                        socket.writeData(authSocket, trData);

                    })
                    .catch((err) => { throw err.toString() });
            } catch (err) {
                Obj.errMsg = err;
            }
            return Obj;
        }
        userINFO()
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        });
    })

module.exports = router;