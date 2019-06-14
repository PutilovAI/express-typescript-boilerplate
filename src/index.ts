import express from 'express';

const APP_PORT = 8888;
const app = express();

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World!');
});

app.listen(APP_PORT);
console.log(`Service started on port ${APP_PORT}`);
