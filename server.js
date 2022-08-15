require('better-module-alias')(__dirname);
const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('$Common/config');
const app = express();
const PORT = 5000;
const authMiddleware = require('./MiddleWare/jwtAuth');
const LoginRouter = require('./Router/Login');
const HeaderBarRouter = require('./Router/HeaderBar');
const ContentRouter = require('./Router/Content');

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});
app.set('jwt_secret', config.secret);

app.use(cookieParser())
app.use(express.json());

app.use('/Main/HeaderBar', authMiddleware);
app.use('/Login', LoginRouter);
app.use('/Main/HeaderBar', HeaderBarRouter);
app.use('/Main/Content', ContentRouter);