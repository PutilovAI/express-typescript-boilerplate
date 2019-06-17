import bodyParser from 'body-parser';
import express from 'express';
import { jsonrpcErrorHandler, jsonrpcRouter } from 'utils/jsonrpc';
import { newsListAction } from './actions';

const router = express.Router();

router.use(bodyParser.json());
router.use(jsonrpcErrorHandler);
router.post('/news', jsonrpcRouter({
    list: newsListAction
}));

export const apiJsonRpcRouter = router;
