require('better-module-alias')(__dirname);
const common = require('$Common/common');
const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('$Common/config');
const app = express();
const authMiddleware = require('./MiddleWare/jwtAuth');
const morganMiddleware = require('./Common/morgan');
const LoginRouter = require('./Router/Login');
const HeaderBarRouter = require('./Router/HeaderBar');
const SidebarRouter = require('./Router/Sidebar');
const ContentRouter = require('./Router/Content');


app.listen(config.port, () => {
    common.logger('info', `listening on ${config.port}`);
});
app.set('jwt_secret', config.secret);

app.use(morganMiddleware);
app.use(cookieParser());
app.use(express.json());

app.use('/auth', LoginRouter);

app.use('/users', authMiddleware); // 해당 URL로 시작하는 모든 요청 시, 토큰 검증 진행
app.use('/users/headers', HeaderBarRouter);
app.use('/users/sidemenus', SidebarRouter);
app.use('/users/contents', ContentRouter);