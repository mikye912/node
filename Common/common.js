module.exports = {
    base64Enc(str) {
        return Buffer.from(str, "utf-8").toString('base64');
    },
    base64Dec(str) {
        return Buffer.from(str, "base64").toString('utf-8');
    },
    uInfo_base64(arrObj) {
        const toStr = Object.values(arrObj[0]).join(':');
        return this.base64Enc(toStr);
    },
    uMenu_base64(arrObj) {
        let arrMenu = new Array();
        let jsonObj = {};
        for (i = 0; i < arrObj.length; i++) {
            let arrSubMenu = new Array();
            if (arrObj[i].MENU_DEPTH == 0) {
                jsonObj = {};
                jsonObj.path = ``;
                jsonObj.name = arrObj[i].MENU_NAME;
                jsonObj.seq = arrObj[i].MENU_SEQ;
            }
            for (k = 0; k < arrObj.length; k++) {
                if (arrObj[i].MENU_SEQ == arrObj[k].PARENT_SEQ) {
                    if (arrObj[i].AUTH_R == 'Y') {
                        let jsonSubObj = {};
                        jsonSubObj.path = arrObj[k].MURL;
                        jsonSubObj.name = arrObj[k].MENU_NAME;
                        jsonSubObj.seq = arrObj[k].MENU_SEQ;
                        arrSubMenu = [...arrSubMenu, jsonSubObj];
                    }
                }
            }

            if (arrObj[i].MENU_SEQ.length < 4) {
                jsonObj.subRoutes = arrSubMenu;
                arrMenu = [...arrMenu, jsonObj];
            } else if (arrObj[i].MENU_DEPTH == 0) {
                jsonObj.path = arrObj[i].MURL;
                arrMenu = [...arrMenu, jsonObj];
            }
        }
        //console.log(JSON.stringify(arrMenu));
        return this.base64Enc(JSON.stringify(arrMenu));
    },
    uSearch_base64(uSearch, uDepart, uTid, uAcq) {
        let arrFin = new Array();
        let jsonFin = new Object();
        let arrObj = new Array();
        let jsonObj = new Object();
        const setSubData = (str) => {
            switch (str) {
                case 'ACQ_CD':
                    jsonObj.SUBDATA = uAcq;
                    return;
                case 'CHECK_CARD':
                    jsonObj.SUBDATA = [
                        {
                            NAME: '신용',
                            VALUE: 'N'
                        },
                        {
                            NAME: '체크',
                            VALUE: 'Y'
                        },
                        {
                            NAME: '기타',
                            VALUE: 'E'
                        },
                    ];
                    return;
                case 'OVSEA_CARD':
                    jsonObj.SUBDATA = [
                        {
                            NAME: '해외',
                            VALUE: 'Y'
                        },
                        {
                            NAME: '국내',
                            VALUE: 'N'
                        },
                    ];
                    return;
                case 'DEP_CD':
                    jsonObj.SUBDATA = uDepart;
                    return;
                case 'TID':
                    jsonObj.SUBDATA = uTid;
                    return;
                case 'APPGB':
                    jsonObj.SUBDATA = [
                        {
                            NAME: '전체거래',
                            VALUE: ''
                        },
                        {
                            NAME: '승인거래',
                            VALUE: 'A'
                        },
                        {
                            NAME: '취소거래',
                            VALUE: 'C'
                        },
                    ];
                    return;
                case 'AUTHSTAT':
                    jsonObj.SUBDATA = [
                        {
                            NAME: '전체거래',
                            VALUE: ''
                        },
                        {
                            NAME: '정상거래',
                            VALUE: '정상거래'
                        },
                        {
                            NAME: '당일취소',
                            VALUE: '당일취소'
                        },
                        {
                            NAME: '전일취소',
                            VALUE: '전일취소'
                        },
                    ];
                    return;
                default:
                    return;
            }
        }
        const setJsonObj = (obj) => {
            jsonObj = {};
            jsonObj.NAME = obj.NAME;
            jsonObj.FIELD = obj.FIELD;
            jsonObj.TYPE = obj.TYPE;
            jsonObj.DEFAULT_YN = obj.DEFAULT_YN;
            jsonObj.SORT = obj.SORT;
            setSubData(obj.FIELD);
        }
        try {
            for (i = 0; i < uSearch.length; i++) {
                if (i !== uSearch.length - 1) {
                    if (uSearch[i].PAGE === uSearch[i + 1].PAGE) {
                        setJsonObj(uSearch[i]);
                        arrObj = [...arrObj, jsonObj];
                    }else{
                        setJsonObj(uSearch[i]);
                        arrObj = [...arrObj, jsonObj];
                        jsonFin = {};
                        jsonFin = {
                            [uSearch[i].PAGE] : arrObj
                        };
                        arrFin = [...arrFin, jsonFin];
                        arrObj = [];
                    }
                } else {
                    setJsonObj(uSearch[i]);
                    arrObj = [...arrObj, jsonObj];
                    jsonFin = {};
                    jsonFin = {
                        [uSearch[i].PAGE]: arrObj
                    };
                    arrFin = [...arrFin, jsonFin];
                    arrObj = [];
                }
            }
            //console.log("test", JSON.stringify(arrFin))
        } catch (err) {
            console.log(err)
        }
        return this.base64Enc(JSON.stringify(arrFin));
    }
}