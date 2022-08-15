const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

    // const token = req.cookies.x_auth;
    const token = req.headers.x_auth;
    //console.log(token);

    // 토큰 유무 검증
    if(!token || token === 'null') {
        return res.status(403).json({
            jwtErr : '로그인 후 이용해 주세요.'
        })
    }

    // 설정한 secret 키(Common/config.js)로 토큰 복호화 검증
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, req.app.get('jwt_secret'), (err, decoded) => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    // 토큰 복호화 후 불일치 시 에러 응답
    const onError = (error) => {
        res.status(403).json({
            jwtErr : '비정상적인 접근이 감지 되었습니다.'
        })
    }

    // 검증 프로세스 실행
    p.then((decoded)=>{
        req.decoded = decoded
        //console.log("decoded : ",decoded);
        next()
    }).catch(onError)
}

module.exports = authMiddleware