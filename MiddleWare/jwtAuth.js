const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    // read the token from header or url 
    const token = req.cookies.x_auth;
    
    //console.log(token);

    // token does not exist
    if(!token) {
        return res.status(403).json({
            jwtErr : '로그인 후 이용해 주세요.'
        })
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, req.app.get('jwt_secret'), (err, decoded) => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(403).json({
            jwtErr : '비정상적인 접근이 감지 되었습니다.'
        })
    }

    // process the promise
    p.then((decoded)=>{
        req.decoded = decoded
        //console.log("decoded : ",decoded);
        next()
    }).catch(onError)
}

module.exports = authMiddleware