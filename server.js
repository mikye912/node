require('better-module-alias')(__dirname);
const common = require('$Common/common');
const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: "./instantclient_21_3" })
const express = require('express');
const app = express();
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});
app.use(express.json());

const getData = async (url, obj, res) => {
    console.log(url);
    return await require(url).run(oracledb, obj, res);
}

app.post('/login/AuthLogin', (req, res) => {
    // ! 세션 관리 로직 추가 필요
    let Obj = new Object();
    const jsonObj = req.body;
    async function userINFO() {
        try {
            const getUinfo = await getData('$Login/AuthLogin',jsonObj, res);
            // const getUinfo = await require('./dbproc/login/login_process').run(oracledb, jsonObj, res);
            console.log(getUinfo)
            let key = Object.keys(getUinfo)[0];
            if (key == "errMsg") {
                throw getUinfo.errMsg;
            }

            function getUserAll() {
                return Promise.all([
                    require('$Login/login_UserMenu').run(oracledb, getUinfo[0]),
                    require('$Login/login_SearchBox').run(oracledb, getUinfo[0]),
                    require('$Login/login_UserDepart').run(oracledb, getUinfo[0]),
                    require('$Login/login_UserTid').run(oracledb, getUinfo[0]),
                    require('$Login/login_UserAcq').run(oracledb)
                ])
                    .then((res) => { return res; })
            }
            await getUserAll().then((res) => {
                Obj.uInfo = common.uInfo_base64(getUinfo);
                Obj.uMenu = common.uMenu_base64(res[0]);
                Obj.uSearch = common.uSearch_base64(res[1], res[2], res[3], res[4]);
            });
        } catch (err) {
            //console.log(err);
            Obj.errMsg = err;
        }
        //console.log(JSON.stringify(Obj.uSearch));
        return Obj;
    }
    userINFO().then(res.send.bind(res));
});

app.route('/Main/HeaderBar/:reqUrl')
    .get((req, res) => {
        const jsonObj = req.query;
        console.log("url",req.originalUrl)

        switch (req.params.reqUrl) {
            case 'getUserName':
                getData('$Main/HeaderBar/getUserName', jsonObj, res).then(res.send.bind(res));
                break;
            case 'getUserMenu':
                getData('./dbproc/header/header_userFav', jsonObj, res).then(res.send.bind(res));
                break;
            default:
                break;
        }
    })
    .put((req, res) => {
        const jsonObj = req.body;
        switch (req.params.reqUrl) {
            case 'userFav':
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
                getData('./dbproc/header/header_setUserFav', obj, res).then(res.send.bind(res));
                break;
            default:
                break;
        }
    })


app.route('/sub_main/sub_0000/:reqUrl')
    .get((req, res) => {
        const jsonObj = req.body;

        switch (req.params.reqUrl) {
            case 'notice_0000':
                getData('./dbproc/dataTotal/main_notice', jsonObj, res).then(res.send.bind(res));
                break;
            default:
                break;
        }
    })
    .post((req, res) => {
        const jsonObj = req.body;
        switch (req.params.reqUrl) {
            case 'chart_0000':
                getData('./dbproc/dataTotal/main_Chart', jsonObj, res).then(res.send.bind(res));
                break;
            case 'sales_0000':
                getData('./dbproc/dataTotal/main_sales', jsonObj, res).then(res.send.bind(res));
                break;
            case 'depo_0000':
                getData('./dbproc/dataTotal/main_depo', jsonObj, res).then(res.send.bind(res));
                break;
            case 'chartData_0000':
                getData('./dbproc/dataTotal/main_ChartData', jsonObj, res).then(res.send.bind(res));
                break;
            default:
                break;
        }
    })

app.get('/sub_main/content/searchBox', (req, res) => {
    const jsonObj = req.query;
    getData('./dbproc/login/login_SearchBox', jsonObj, res).then(res.send.bind(res));
});

// app.post('/sub_main/content/sub_0201', (req, res) => {
//     const jsonObj = req.body;
//     async function getData() {
//         return await require('./dbproc/header/header_userFav').run(oracledb, jsonObj, res);
//     }
//     getUserFav().then(res.send.bind(res));
// });