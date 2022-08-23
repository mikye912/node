const dbconn = require('$Common/dbconn');
const common = require('$Common/common');
const express = require('express');
const router = express.Router();

router.route('/getUserSearch')
    .get((req, res) => {
        let obj = new Object();

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        const getSearch = async () => {
            let arr = new Array();
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserSearch', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserDepart', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserTid', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserAcq')];

            return await dbconn.getDataAll(arr).then((res) => {
                return common.uSearch_trans(res[0], res[1], res[2], res[3]);
            });
        }
        getSearch().then(res.send.bind(res));
    })

router.route('/Sub0000/:reqUrl')
    .get((req, res) => {

        switch (req.params.reqUrl) {
            case 'notice_0000':
                dbconn.getData(`$Main/Content/Sub0000/${req.params.reqUrl}`).then(res.send.bind(res));
                break;
            default:
                break;
        }
    })
    .post((req, res) => {
        let obj = new Object();

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        dbconn.getData(`$Main/Content/Sub0000/${req.params.reqUrl}`, obj, res).then(res.send.bind(res));
    })

router.route('/Sub0201/:reqUrl')
    .post((req, res) => {
        let obj = new Object();
        
        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        if(!common.isEmptyObj(req.body.where)){
            console.log(req.body.where)
        }else{
            console.log('빈 객체');
        }
        
        //console.log(`${req.params.reqUrl} \n => ${JSON.stringify(req.body.where)}`)
        //res.send('아직 미구현');
        /*
        {
            "APPNO": "22074616",
            "ADD_CID": "3570526",
            "ADD_CASHER": "K032",
            "SAMOUNT": "0",
            "EAMOUNT": "1300",
            "CARDNO": "12345678901234",
            "MID": "72209332",
            "ADD_CD": "FC",
            "ADD_GB": "O",
            "SDATE": "20220823",
            "EDATE": "20220823",
            "ACQ_CD": "VC0030,12",
            "CHECK_CARD": "Y",
            "OVSEA_CARD": "N",
            "DEP_CD": [
                "MD1599704551",
                "MD1603168055"
            ],
            "TID": [
                "0370000",
                "8102004001",
                "8102013001"
            ],
            "APPGB": [
                "A"
            ],
            "AUTHSTAT": [
                "정상거래"
            ]
        }
        */
        dbconn.getData(`$Main/Content/Sub0201/${req.params.reqUrl}`, obj, res).then(res.send.bind(res));
    })

module.exports = router;