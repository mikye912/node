const jwt = require('jsonwebtoken');

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
                    try{
                    let arrRst = [];
                    let arrTid = [];
                    let objTid = {};
                    for (i = 0; i < uTid.length; i++) {
                        if (i !== uTid.length - 1) {
                            if (uTid[i].TITLE === uTid[i + 1].TITLE) {
                                objTid.TITLE = uTid[i].TITLE;
                                let obj = {};
                                obj.NAME = uTid[i].NAME;
                                obj.VALUE = uTid[i].VALUE;
                                arrTid = [...arrTid, obj];
                            } else {
                                objTid.TITLE = uTid[i].TITLE;
                                let obj = {};
                                obj.NAME = uTid[i].NAME;
                                obj.VALUE = uTid[i].VALUE;
                                arrTid = [...arrTid, obj];
                                objTid.TID = arrTid;
                                arrTid = [];
                                arrRst = [...arrRst, objTid];
                                objTid = {};
                            }
                        } else {
                            objTid.TITLE = uTid[i].TITLE;
                            let obj = {};
                            obj.NAME = uTid[i].NAME;
                            obj.VALUE = uTid[i].VALUE;
                            arrTid = [...arrTid, obj];
                            objTid.TID = arrTid;
                            arrTid = [];
                            arrRst = [...arrRst, objTid];
                            objTid = {};
                        }
                    }
                    jsonObj.SUBDATA = arrRst;
                }catch(err){
                    console.log(err);
                }
                    // jsonObj.SUBDATA = [
                    //     {
                    //         "TITLE": "가온병원_원무",
                    //         "TID": [
                    //             {
                    //                 "NAME": "모바일_SSG페이(KIS)",
                    //                 "VALUE": "39219973"
                    //             },
                    //             {
                    //                 "NAME": "모바일_메디블록(KIS)",
                    //                 "VALUE": "39259586"
                    //             },
                    //             {
                    //                 "NAME": "모바일_무인수납(KIS)",
                    //                 "VALUE": "39219244"
                    //             },
                    //             {
                    //                 "NAME": "모바일_복지관(KIS)",
                    //                 "VALUE": "39219246"
                    //             },
                    //             {
                    //                 "NAME": "모바일_본원(KIS)",
                    //                 "VALUE": "39219264"
                    //             },
                    //             {
                    //                 "NAME": "모바일_본원2(KIS)",
                    //                 "VALUE": "39219243"
                    //             },
                    //             {
                    //                 "NAME": "모바일_삼성페이(KIS)",
                    //                 "VALUE": "39219383"
                    //             },
                    //             {
                    //                 "NAME": "모바일_암센터(KIS)",
                    //                 "VALUE": "39219245"
                    //             },
                    //             {
                    //                 "NAME": "모 바일_의무기록발급(KIS)",
                    //                 "VALUE": "39248951"
                    //             },
                    //             {
                    //                 "NAME": "모바일_일반(KIS)",
                    //                 "VALUE": "39229543"
                    //             },
                    //             {
                    //                 "NAME": "모바일_입원비중간(KIS)",
                    //                 "VALUE": "39248952"
                    //             },
                    //             {
                    //                 "NAME": "모바일_제증명발급(KIS)",
                    //                 "VALUE": "39229542"
                    //             },
                    //             {
                    //                 "NAME": "모바일_진료비WEB(KIS)",
                    //                 "VALUE": "39259488"
                    //             },
                    //             {
                    //                 "NAME": "무인수납(NICE)",
                    //                 "VALUE": "8102002001"
                    //             },
                    //             {
                    //                 "NAME": "무인수납(금결원)",
                    //                 "VALUE": "904430"
                    //             },
                    //             {
                    //                 "NAME": "본원(NICE)",
                    //                 "VALUE": "8102001002"
                    //             },
                    //             {
                    //                 "NAME": "본원(NICE)",
                    //                 "VALUE": "8102001001"
                    //             },
                    //             {
                    //                 "NAME": "본원(금결원)",
                    //                 "VALUE": "904420"
                    //             },
                    //             {
                    //                 "NAME": "본원, 무인수납(KICC)",
                    //                 "VALUE": "0407804"
                    //             },
                    //             {
                    //                 "NAME": "암센터(KICC)",
                    //                 "VALUE": "0370000"
                    //             },
                    //             {
                    //                 "NAME": "암센터(NICE)",
                    //                 "VALUE": "8102003001"
                    //             },
                    //             {
                    //                 "NAME": "암센터(금결원)",
                    //                 "VALUE": "904450"
                    //             },
                    //             {
                    //                 "NAME": "장례식장(NICE)",
                    //                 "VALUE": "8102004001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장(금결원)",
                    //                 "VALUE": "904460"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_그레이스플로라",
                    //                 "VALUE": "8102015001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_대한운수",
                    //                 "VALUE": "8102013001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_마트24시",
                    //                 "VALUE": "8102008001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_미림식품",
                    //                 "VALUE": "8102007001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_삼포실버드림",
                    //                 "VALUE": "8102010001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_새서울캐딜 락",
                    //                 "VALUE": "8102012001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_아펙스넷",
                    //                 "VALUE": "8102014001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_영광토탈써비스",
                    //                 "VALUE": "8102009001"
                    //             },
                    //             {
                    //                 "NAME": "장례식장_일원BMS",
                    //                 "VALUE": "8102011001"
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         "TITLE": "가온병원_이마트",
                    //         "TID": [
                    //             {
                    //                 "NAME": "모바일_주차장01",
                    //                 "VALUE": "39262048"
                    //             },
                    //             {
                    //                 "NAME": "주차장(NICE)",
                    //                 "VALUE": "8102006001"
                    //             },
                    //             {
                    //                 "NAME": "주차장(금결원)",
                    //                 "VALUE": "904440"
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         "TITLE": "가온병원_장례식장",
                    //         "TID": [
                    //             {
                    //                 "NAME": "모바일_직원용(KIS)",
                    //                 "VALUE": "39219247"
                    //             },
                    //             {
                    //                 "NAME": "직원용(KICC)",
                    //                 "VALUE": "6740460"
                    //             },
                    //             {
                    //                 "NAME": "직원용(NICE)",
                    //                 "VALUE": "9109910001"
                    //             },
                    //             {
                    //                 "NAME": "직원용(금결원)",
                    //                 "VALUE": "904500"
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         "TITLE": "가온병원_주차장",
                    //         "TID": [
                    //             {
                    //                 "NAME": "검진센터(KICC)",
                    //                 "VALUE": "6740446"
                    //             },
                    //             {
                    //                 "NAME": "검진센터(NICE)",
                    //                 "VALUE": "8102005002"
                    //             },
                    //             {
                    //                 "NAME": "검진센터(NICE)",
                    //                 "VALUE": "8102005001"
                    //             },
                    //             {
                    //                 "NAME": "검진센터(금결원)",
                    //                 "VALUE": "904490"
                    //             },
                    //             {
                    //                 "NAME": "모바일_검진센터(KIS)",
                    //                 "VALUE": "39219248"
                    //             }
                    //         ]
                    //     }
                    // ];
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
            console.log(jsonObj)
        }
        try {
            for (i = 0; i < uSearch.length; i++) {
                //console.log(uSearch.length)
                //console.log(uSearch[i].PAGE)
                if (i !== uSearch.length - 1) {
                    //console.log(uSearch[i].PAGE)
                    if (uSearch[i].PAGE === uSearch[i + 1].PAGE) {
                        //console.log(i);
                        setJsonObj(uSearch[i]);
                        arrObj = [...arrObj, jsonObj];
                        //console.log(JSON.stringify(arrObj))
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
                } else {
                    //console.log(uSearch[i].PAGE)
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
            console.log("err")
        }
        return this.base64Enc(JSON.stringify(arrFin));
    },
    signToken(dataObj, secret, payloadObj) {
        return new Promise((resolve, reject) => {
            jwt.sign(
                dataObj,
                secret,
                payloadObj,
                (err, token) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(token)
                })
        })
    },
    reqTokenToUinfo(reqToken) {
        const token = reqToken; // 클라이언트 요청 헤더의 토큰 추출 
        const payload = JSON.parse(this.base64Dec(token.split('.')[1])); // 토큰의 payload(사용자 정보) 추출
        return this.base64Dec(payload.uInfo).split(':');
    }
}