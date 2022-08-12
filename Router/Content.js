const dbconn = require('$Common/dbconn');
const express = require('express');
const router = express.Router();

router.route('/Sub0000/:reqUrl')
    .get((req, res) => {
        const jsonObj = req.body;

        switch (req.params.reqUrl) {
            case 'notice_0000':
                dbconn.getData(`$Main/Content/Sub0000/${req.params.reqUrl}`, jsonObj, res).then(res.send.bind(res));
                break;
            default:
                break;
        }
    })
    .post((req, res) => {
        const jsonObj = req.body;
        dbconn.getData(`$Main/Content/Sub0000/${req.params.reqUrl}`, jsonObj, res).then(res.send.bind(res));
    })
    
module.exports = router;