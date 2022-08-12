require('better-module-alias')(__dirname);
const express = require('express');
const app = express();
const PORT = 5000;
const loginRouter = require('./Router/Login');
const HeaderBarRouter = require('./Router/HeaderBar');
const ContentRouter = require('./Router/Content');

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});
app.use(express.json());
app.use('/Login', loginRouter);
app.use('/Main/HeaderBar', HeaderBarRouter);
app.use('/Main/Content', ContentRouter);