const dbconn = require('$Common/dbconn');
const common = require('$Common/common');
const express = require('express');
const router = express.Router();

router.route('/')
    .get((req, res) => {
        let obj = new Object();
        
        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);
        
        const getMenu = async () => {
            const uMenu = await dbconn.getData(`$Main/Sidebar/getUserMenu`, obj, res)
            return common.uMenu_trans(uMenu);
        }
        getMenu()
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        });
    })

module.exports = router;