const dbconn = require('$Common/dbconn');
const express = require('express');
const router = express.Router();

router.route('/:reqUrl')
    .get((req, res) => {
        const jsonObj = req.query;
        dbconn.getData(`$Main/HeaderBar/${req.params.reqUrl}`, jsonObj, res).then(res.send.bind(res));
    })
    .put((req, res) => {
        const jsonObj = req.body;
        switch (req.params.reqUrl) {
            case 'setUserFav':
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
                obj.userId = jsonObj.userId;
                obj.seq = seq;
                obj.sort = jsonObj.right.length > 0 ? sql : sort;
                dbconn.getData(`$Main/HeaderBar/${req.params.reqUrl}`, obj, res).then(res.send.bind(res));
                break;
            default:
                break;
        }
    })

module.exports = router;