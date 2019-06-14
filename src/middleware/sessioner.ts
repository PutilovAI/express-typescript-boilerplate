import express from 'express';
import uuid from 'uuid';

type SessionerMiddleware = (req: express.Request, res: express.Response, next: () => void) => void;

const DEFAULT_MAX_AGE = 900000; // 1000 * 60 * 15 = 15 min

export function sessioner(tokenName: string, maxAge?: number): SessionerMiddleware {
    return (req: express.Request, res: express.Response, next: () => void): void => {
        if (req.cookies[tokenName]) return next();

        const token = uuid();
        req.cookies[tokenName] = token;
        res.cookie(tokenName, token, { maxAge: maxAge || DEFAULT_MAX_AGE, httpOnly: true });

        next();
    };
}
