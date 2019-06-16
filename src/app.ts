import { apiJsonRpcRouter } from 'api-json-rpc';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import { sessioner } from 'middleware';

const NODE_ENV = process.env.NODE_ENV || 'production';
const CONFIG = process.env.CONFIG || 'prod';
const APP_PORT = 8888;
const APP_COOKIE_KEY = 'CSRF-TOKEN';
const APP_COOKIE_LIFETIME = 86400000; // 1000 * 60 * 60 * 24

const app = express();

app.use(cookieParser());
app.use(sessioner(APP_COOKIE_KEY, APP_COOKIE_LIFETIME));

app.use('/api', apiJsonRpcRouter);

app.use('/', bodyParser.raw());
app.get('/', (req: express.Request, res: express.Response) => {
    res.json({
        config: CONFIG,
        cookie_key: req.cookies[APP_COOKIE_KEY],
        cwd: process.cwd(),
        env: NODE_ENV,
        message: 'Hello World!'
    });
});

app.listen(APP_PORT);
console.log(`Service started on port ${APP_PORT}`);
