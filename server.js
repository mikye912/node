require('better-module-alias')(__dirname);
const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('$Common/config');
const app = express();
const authMiddleware = require('./MiddleWare/jwtAuth');
const LoginRouter = require('./Router/Login');
const HeaderBarRouter = require('./Router/HeaderBar');
const ContentRouter = require('./Router/Content');

app.listen(config.port, () => {
    console.log(`listening on ${config.port}`);
});
app.set('jwt_secret', config.secret);

app.use(cookieParser());
app.use(express.json());

app.use('/Login', LoginRouter);

app.use('/Main', authMiddleware); // 해당 URL로 시작하는 모든 요청 시, 토큰 검증 진행
app.use('/Main/HeaderBar', HeaderBarRouter);
app.use('/Main/Content', ContentRouter);