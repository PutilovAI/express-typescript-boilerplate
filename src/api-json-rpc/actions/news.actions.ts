import express from 'express';
import { createJsonrpcResponseSuccess } from 'utils/jsonrpc';

export function newsListAction(req: express.Request, res: express.Response): void {
    console.log('newsListAction');
    res.json(createJsonrpcResponseSuccess('kek', 'lol-id'));
}
