const jwt = require('jsonwebtoken');

module.exports = {
    /**
     * 문자열에서 특수문자 제거 하는 함수
     * @param {String} str 문자열 타입
     * @returns 특수문자 제거 한 문자열 을 반환
     */
    regReplace(str) {
        const reg = /[^\w\sㄱ-힣]|[\_]/g;
        return str.replace(reg, ``);
    },
    /**
     * Array가 빈 객체인지 체크 하는 함수
     * @param {*} arr Array 타입의 객체
     * @returns 빈 객체이면 true, 아니면 false 반환
     */
    isEmptyArr(arr) {
        if (Array.isArray(arr) && arr.length === 0) {
            return true;
        }
        return false;
    },
    /**
     * Object가 빈 객체인지 체크 하는 함수
     * @param {Object} obj Object 타입의 객체
     * @returns 빈 객체이면 true, 아니면 false 반환
     */
    isEmptyObj(obj) {
        if (obj.constructor === Object && Object.keys(obj).length === 0) {
            return true;
        }
        return false;
    },
    /**
     * 문자열을 base64로 암호화 하는 함수
     * @param {String} str 문자열 타입
     * @returns 암호화된 문자열 반환
     */
    base64Enc(str) {
        return Buffer.from(str, "utf-8").toString('base64');
    },
    /**
     * base64로 암호화된 문자열을 복호화 하는 함수
     * @param {String} str 문자열 타입
     * @returns 복호화된 문자열 반환
     */
    base64Dec(str) {
        return Buffer.from(str, "base64").toString('utf-8');
    },
    /**
     * 사용자 정보를 가지고있는 Array 객체를 ':' 구분자로 합쳐 base64 로 암호화 하는 함수
     * @param {Array} arrObj Array 타입의 객체
     * @returns 암호화된 문자열 반환
     */
    uInfo_base64(arrObj) {
        const toStr = Object.values(arrObj[0]).join(':');
        return this.base64Enc(toStr);
    },
    /**
     * 사용자의 메뉴를 가지고있는 Array 객체를 클라이언트에 맞는 Array 객체로 바꾸어 문자열로 변환하는 함수
     * @param {Array} arrObj Array 타입의 객체
     * @returns Array 형태인 문자열(JSON.stringify()) 을 반환
     */
    uMenu_trans(arrObj) {
        let arrMenu = new Array();
        let jsonObj = {};
        arrObj.map((crr, i, arrObj) => {
            let arrSubMenu = new Array();
            if (arrObj[i].MENU_DEPTH == 0) {
                jsonObj = {};
                jsonObj.path = ``;
                jsonObj.name = arrObj[i].MENU_NAME;
                jsonObj.seq = arrObj[i].MENU_SEQ;
            }
            arrObj.map((crr, k, arrObj) => {
                if (arrObj[i].MENU_SEQ == arrObj[k].PARENT_SEQ) {
                    if (arrObj[i].AUTH_R == 'Y') {
                        let jsonSubObj = {};
                        jsonSubObj.path = arrObj[k].MURL;
                        jsonSubObj.name = arrObj[k].MENU_NAME;
                        jsonSubObj.seq = arrObj[k].MENU_SEQ;
                        arrSubMenu = [...arrSubMenu, jsonSubObj];
                    }
                }
            })
            if (arrObj[i].MENU_SEQ.length < 4) {
                jsonObj.subRoutes = arrSubMenu;
                arrMenu = [...arrMenu, jsonObj];
            } else if (arrObj[i].MENU_DEPTH == 0) {
                jsonObj.path = arrObj[i].MURL;
                arrMenu = [...arrMenu, jsonObj];
            }
        })
        return JSON.stringify(arrMenu);
    },
    /**
     * 각 가맹점에 맞는 검색조건을 클라이언트에 맞는 Array 객체로 바꾸어 문자열로 변환하는 함수
     * @param {Array} uSearch 각 페이지의 검색조건을 담은 Array 타입의 객체
     * @param {Array} uDepart 각 가맹점의 사업부 정보를 담은 Array 타입의 객체
     * @param {Array} uTid 각 가맹점의 단말기 정보를 담은 Array 타입의 객체
     * @param {Array} uAcq 각 가맹점의 카드사 정보를 담은 Array 타입의 객체
     * @returns Array 형태인 문자열(JSON.stringify()) 을 반환
     */
    uSearch_trans(uSearch, uDepart, uTid, uAcq) {
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
                    let arrRst = [];
                    let arrTid = [];
                    let objTid = {};

                    uTid.map((crr, i, uTid) => {
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
                    });
                    jsonObj.SUBDATA = arrRst;
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
            uSearch.map((crr, i, uSearch) => {
                if (i !== uSearch.length - 1) {
                    if (uSearch[i].PAGE === uSearch[i + 1].PAGE) {
                        setJsonObj(uSearch[i]);
                        arrObj = [...arrObj, jsonObj];
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
                    setJsonObj(uSearch[i]);
                    arrObj = [...arrObj, jsonObj];
                    jsonFin = {};
                    jsonFin = {
                        [uSearch[i].PAGE]: arrObj
                    };
                    arrFin = [...arrFin, jsonFin];
                    arrObj = [];
                }
            })
            //console.log("test", JSON.stringify(arrFin))
        } catch (err) {
            console.log(err)
        }
        return JSON.stringify(arrFin);
    },
    /**
     * JsonWebToken 을 발급해주는 Promise 객체를 담은 함수
     * @param {Object} dataObj 사용자 정보를 담은 Object 타입의 객체
     * @param {String} secret 토큰 검증 시 필요한 secret 키를 담은 문자열 타입
     * @param {Object} payloadObj JWT의 옵션을 담은 Object 타입의 객체
     * @returns Promise 객체의 결과인 resolve, reject 반환
     */
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
    /**
     * API 요청 받을 시 헤더로부터 받은 토큰의 사용자정보를 ':' 구분자로 나누어 주는 함수
     * @param {String} reqToken JWT 정보를 담은 문자열 타입
     * @returns Array 객체 반환
     */
    reqTokenToUinfo(reqToken) {
        const token = reqToken; // 클라이언트 요청 헤더의 토큰 추출 
        const payload = JSON.parse(this.base64Dec(token.split('.')[1])); // 토큰의 payload(사용자 정보) 추출
        return this.base64Dec(payload.uInfo).split(':');
    },
    /**
     * 현재 날짜 데이터를 반환하는 함수 객체
     */
    nowDate: {
        fullDate: (num = 0) => {
            let data = new Date();
            data = data.setDate(new Date().getDate() + (num));

            let day = new Date(data);

            const year = day.getFullYear();
            const month = day.getMonth() + 1;
            const date = day.getDate();

            return `${year}${month >= 10 ? month : '0' + month}${date >= 10 ? date : '0' + date}`;
        },
        year: (num = 0) => {
            return new Date().getFullYear() + (num);
        },
        month: (num = 0) => {
            return new Date().getMonth() + 1 + (num);
        },
        date: (num = 0) => {
            return new Date().getDate() + (num);
        },
        day: (num = 0) => {
            const week = ['일', '월', '화', '수', '목', '금', '토'];
            //const day = new Date().getDay();
            let data = new Date();
            data = data.setDate(new Date().getDate() + (num));

            let day = new Date(data);
            day = day.getDay();

            return week[day];
        },
        hours: (num = 0) => {
            // return new Date().getHours() + (num);
            let data = new Date();
            data = data.setHours(new Date().getHours() + (num));

            let hours = new Date(data);
            hours = hours.getHours();

            return hours.toString().padStart(2,'0');
        },
        minutes: (num = 0) => {
            // return new Date().getMinutes() + (num);
            let data = new Date();
            data = data.setMinutes(new Date().getMinutes() + (num));

            let minutes = new Date(data);
            minutes = minutes.getMinutes();

            return minutes.toString().padStart(2,'0');
        },
        seconds: (num = 0) => {
            // return new Date().getSeconds() + (num);
            let data = new Date();
            data = data.setHours(new Date().getSeconds() + (num));

            let seconds = new Date(data);
            seconds = seconds.getSeconds();

            return seconds.toString().padStart(2,'0');
        }
    },
}