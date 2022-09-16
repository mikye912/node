const dbconn = require('$Common/dbconn');
const common = require('$Common/common');
const express = require('express');
const router = express.Router();

router.route('/items')
    .get((req, res) => {
        let obj = new Object();

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        const getSearch = async () => {
            let arr = new Array();
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserSearch', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserDepart', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserTid', obj)];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserAcq')];
            arr = [...arr, dbconn.createPromise('$Main/Content/getUserDomain', obj)];

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

router.route('/:pages/:do')
    .get((req, res) => {
        let obj = new Object();
        let fetchData;

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        switch (req.params.pages) {
            case '0000':
                switch (req.params.do) {
                    case 'chart':
                        fetchData = async () => {
                            let arr = new Array();
                            arr = [...arr, dbconn.createPromise(`$Main/Content/Sub0000/chart_0000`, obj)];
                            arr = [...arr, dbconn.createPromise('$Main/Content/Sub0000/chartData_0000', obj)];
                
                            return await dbconn.getDataAll(arr)
                            .then((res) => {
                                return {
                                   chart: res[0],
                                   chartData: res[1],
                                }
                            });
                        }
                        break;
                    case 'deposit':
                        fetchData = async () => {
                            return await dbconn.getData(`$Main/Content/Sub0000/depo_0000`, obj, res)
                        }
                        break;
                    case 'notice':
                        fetchData = async () => {
                            return await dbconn.getData(`$Main/Content/Sub0000/notice_0000`, obj, res)
                        }
                        break;
                    case 'sales':
                        fetchData = async () => {
                            return await dbconn.getData(`$Main/Content/Sub0000/sales_0000`, obj, res)
                        }
                        break;
                    default:
                        break;
                }
                break;
            case '0201':
                if (!common.isEmptyObj(req.query)){
                    obj.where = JSON.parse(common.cryptoDec(req.query.reqData));
                    console.log(obj.where);
                }else{
                    console.log('빈 객체');
                }
                    switch (req.params.do) {
                        case 'totalcols':
                            fetchData = async () => {
                                return await dbconn.getData(`$Main/Content/getTotalCols`, obj, res);
                            }
                        break;
                        case 'detailcols':
                            fetchData = async () => {
                                return await dbconn.getData(`$Main/Content/getDetailCols`, obj, res);
                            }
                        break;
                        case 'searchparams':
                            obj.pages = req.params.pages;

                            fetchData = async () => {
                                let arr = new Array();
                                arr = [...arr, dbconn.createPromise('$Main/Content/getUserSearch', obj)];
                                arr = [...arr, dbconn.createPromise('$Main/Content/getUserDepart', obj)];
                                arr = [...arr, dbconn.createPromise('$Main/Content/getUserTid', obj)];
                                arr = [...arr, dbconn.createPromise('$Main/Content/getUserAcq')];
                    
                                return await dbconn.getDataAll(arr)
                                .then((res) => {
                                    return common.uSearch_trans(res[0], res[1], res[2], res[3]);
                                });
                            }
                        break;
                        case 'total':
                            fetchData = async () => {
                                let data = await dbconn.getData(`$Main/Content/Sub0201/getTotalData`, obj, res);
                                return common.setRnumData(data);
                            }
                            break;
                        case 'detail':
                            fetchData = async () => {
                                let data = await dbconn.getData(`$Main/Content/Sub0201/getDetailData`, obj, res);
                                return common.setRnumData(data);
                            }
                            break;
                        default:
                            break;
                    }
                break;
            case '0202' :
            break;
            case '0203' :
            break;
            case '0204' :
            break;
            case '0205' :
            break;
            case '0206' :
            break;
            case '0207' :
            break;
            case '0208' :
            break;
            case '0209' :
            break;
            case '0210' :
            break;
            case '0211' :
            break;
            case '0212' :
            break;
            case '0213' :
            break;
            case '0214' :
            break;
            case '0215' :
            break;
            case '0216' :
            break;
            case '0217' :
            break;
            default:
                break;
        }

        fetchData()
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        });
    })
    .put((req, res) => {
        let obj = new Object();
        const jsonObj = req.body;
        let fetchData;

        obj.uInfo = common.reqTokenToUinfo(req.headers.x_auth);

        switch (req.params.pages) {
            case '0201':
                if (!common.isEmptyObj(req.params.pages)){
                    console.log(req.params.do);
                }else{
                    console.log('빈 객체');
                }
                    switch (req.params.do) {
                        case 'total':
                        case 'detail':
                            let visiable = null;
                            let sort = null;
                            let visiableSql = " CASE";
                            let sortSql = " CASE";
                            jsonObj.ITEMS.map((gridHeaders, index) => {
                                visiableSql += " WHEN HEADERNAME = '" + gridHeaders.headerName + "' THEN '" + gridHeaders.visiable + "'"
                                sortSql += " WHEN HEADERNAME = '" + gridHeaders.headerName + "' THEN " + (index + 1)
                            })
                            visiableSql += " ELSE null END ";
                            sortSql += " ELSE null END ";
                            
                            obj.page = jsonObj.PAGE;
                            obj.category = jsonObj.CATEGORY;
                            obj.visiable = jsonObj.ITEMS.length > 0 ? visiableSql : visiable;
                            obj.sort = jsonObj.ITEMS.length > 0 ? sortSql : sort;
                            console.log(obj);
                            fetchData = async () => {
                                return await dbconn.getData(`$Main/Content/Sub0201/setGridHeaders`, obj, res);
                            }
                            break;
                        default:
                            break;
                    }
                break;
            default:
                break;
        }
        fetchData()
        .then(res.send.bind(res))
        .catch((err) => {
            res.status(500).send(err.toString())
        });
    })

module.exports = router;