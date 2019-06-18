import express from 'express';
import { createJsonrpcResponseSuccess } from 'utils/jsonrpc';

export function newsListAction(req: express.Request, res: express.Response): void {
    const result = [1, 1, 1, req.body, 1, 1, 1];

    if (req.body.params.error) {
        throw Error(req.body.params.error);
    }

    res.json(createJsonrpcResponseSuccess(result, req.body.id));
}
