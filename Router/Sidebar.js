const dbconn = require('$Common/dbconn');
const common = require('$Common/common');
const express = require('express');
const router = express.Router();

router.route('/:reqUrl')
    .get((req, res) => {
        let obj = new Object();

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        dbconn.getData(`$Main/Sidebar/${req.params.reqUrl}`, obj, res).then(res.send.bind(res));
    })

module.exports = router;