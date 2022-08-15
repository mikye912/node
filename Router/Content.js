const dbconn = require('$Common/dbconn');
const common = require('$Common/common');
const express = require('express');
const router = express.Router();

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
    
module.exports = router;