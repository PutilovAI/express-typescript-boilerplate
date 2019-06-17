import express from 'express';
import { createJsonrpcResponseSuccess } from 'utils/jsonrpc';

export function newsListAction(req: express.Request, res: express.Response): void {
    console.log('newsListAction');
    if (0 === +'0') {
        throw Error('action error');
    }
    res.json(createJsonrpcResponseSuccess('kek', 'lol-id'));
}
