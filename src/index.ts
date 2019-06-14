import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import { sessioner } from 'middleware';

// Set alias values in .babelrc so you can use imports with absolute paths

const NODE_ENV = process.env.NODE_ENV || 'prod';
const APP_PORT = 8888;
const APP_COOKIE_KEY = 'CSRF-TOKEN';
const APP_COOKIE_LIFETIME = 86400000; // 1000 * 60 * 60 * 24
const APP_BODY_PARSER = bodyParser.raw(); // json, raw, text, urlencoded

const app = express();

app.use(cookieParser());
app.use(APP_BODY_PARSER);
app.use(sessioner(APP_COOKIE_KEY, APP_COOKIE_LIFETIME));

app.get('/', (req: express.Request, res: express.Response) => {
    res.json({
        cookie_key: req.cookies[APP_COOKIE_KEY],
        cwd: process.cwd(),
        env: NODE_ENV,
        message: 'Hello World!'
    });
});

app.listen(APP_PORT);
console.log(`Service started on port ${APP_PORT}`);
