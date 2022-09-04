const dbconn = require('$Common/dbconn');
const common = require('$Common/common');
const express = require('express');
const router = express.Router();

router.route('/:reqUrl')
    .get((req, res) => {
        let obj = new Object();
        let path = "";

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        switch (req.params.reqUrl) {
            case 'favorites': path = 'getUserFav'; break;
            case 'name': path = 'getUserName'; break;
            default: break;
        }

        dbconn.getData(`$Main/HeaderBar/${path}`, obj, res)
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        });
    })
    .put((req, res) => {
        const jsonObj = req.body;
        
        switch (req.params.reqUrl) {
            case 'favorites':
                let arrSeq = new Array();
                let obj = new Object();
                let seq = '';
                let sort = null;
                let sql = " CASE"
                jsonObj.right.map((favMenus, index) => {
                    arrSeq.push(favMenus.PROGRAM_SEQ);
                    sql += " WHEN PROGRAM_SEQ = '" + favMenus.PROGRAM_SEQ + "' THEN " + (index + 1)
                })
                sql += " ELSE null END "
                seq = seq.concat(arrSeq.join("','"));
                obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);
                obj.seq = seq;
                obj.sort = jsonObj.right.length > 0 ? sql : sort;
                dbconn.getData(`$Main/HeaderBar/setUserFav`, obj, res)
                .then(res.send.bind(res))
                .catch((err) => {
                    res.status(500).send(err.toString())
                });
                break;
            default:
                break;
        }
    })

module.exports = router;