const dbconn = require('$Common/dbconn');
const common = require('$Common/common');
const express = require('express');
const router = express.Router();

router.route('/usercontent')
    .get((req, res) => {
        let obj = new Object();

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        const getSearch = async () => {
            let arr = new Array();
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserSearch', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserDepart', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserTid', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserAcq')];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserSearch', obj)];

            return await dbconn.getDataAll(arr)
            .then((res) => {
                return {
                   uSearch: common.uSearch_trans(res[0], res[1], res[2], res[3]),
                   uDomain: res[4],
                }
            });
        }
        getSearch()
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        });
    })

router.route('/Sub0000/:reqUrl')
    .get((req, res) => {
        let obj = new Object();

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        dbconn.getData(`$Main/Content/Sub0000/${req.params.reqUrl}`, obj, res)
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        });
    })

router.route('/Sub0201/:reqUrl')
    .get((req, res) => {
        let obj = new Object();
        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        if (!common.isEmptyObj(req.query)){
            obj.where = req.query;
            console.log(obj.where);
        }else{
            console.log('빈 객체');
        }
        const getRows = async () => {
            let data = await dbconn.getData(`$Main/Content/Sub0201/${req.params.reqUrl}`, obj, res);
            return common.setRnumData(data);
        }
        getRows()
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        })
    })

module.exports = router;