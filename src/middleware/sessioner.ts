import express from 'express';
import uuid from 'uuid';

const DEFAULT_MAX_AGE = 1000 * 60 * 15; // 15 min

export function sessioner(tokenName: string, maxAge?: number): (req: express.Request, res: express.Response, next: () => void) => void {
    return function (req: express.Request, res: express.Response, next: () => void): void {
        if (req.cookies[tokenName]) return next();

        const token = uuid();
        req.cookies[tokenName] = token;
        res.cookie(tokenName, token, { maxAge: maxAge || DEFAULT_MAX_AGE, httpOnly: true });

        next();
    };
}
