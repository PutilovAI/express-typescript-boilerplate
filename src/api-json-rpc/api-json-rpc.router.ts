import express from 'express';
import { jsonrpcRouter } from 'utils/jsonrpc';
import { newsListAction } from './actions';

const router = express.Router();

router.post('/news', jsonrpcRouter({
    list: newsListAction
}));

export const apiJsonRpcRouter = router;
