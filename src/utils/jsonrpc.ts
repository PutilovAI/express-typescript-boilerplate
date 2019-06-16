import {
    NextFunction,
    Request,
    RequestHandler,
    Response
} from 'express';
import uuid from 'uuid';

/**
 * CONSTANTS
 */

const JSONRPC_VERSION = '2.0';

const JSONRPC_PARSE_ERROR_CODE = -32700;
const JSONRPC_PARSE_ERROR_MESSAGE = 'Parse error';

const JSONRPC_INVALID_REQUEST_CODE = -32600;
const JSONRPC_INVALID_REQUEST_MESSAGE = 'Invalid Request';

const JSONRPC_METHOD_NOT_FOUND_CODE = -32601;
const JSONRPC_METHOD_NOT_FOUND_MESSAGE = 'Method not found';

const JSONRPC_INVALID_PARAMS_CODE = -32602;
const JSONRPC_INVALID_PARAMS_MESSAGE = 'Invalid params';

const JSONRPC_INTERNAL_ERROR_CODE = -32603;
const JSONRPC_INTERNAL_ERROR_MESSAGE = 'Internal error';

/**
 * TYPES
 */

export type JsonrpcID = string | number | null;
export type JsonrpcParams = object;
export type JsonrpcResult = object | string | number | boolean;
export type JsonrpcErrorData = object | string | number;
export type JsonrpcError = {
    code: number,
    message: string,
    data?: JsonrpcErrorData
};

export type JsonrpcRequest = {
    jsonrpc: string,
    method: string,
    params?: JsonrpcParams,
    id?: JsonrpcID
};

export type JsonrpcResponse = {
    jsonrpc: string,
    result?: JsonrpcResult,
    error?: JsonrpcError,
    id: JsonrpcID
};

/**
 * Create JsonrpcError object
 */
export function createJsonrpcError(code: number, message: string, data?: JsonrpcErrorData): JsonrpcError {
    const error = Object.create(null);

    error.code = code;
    error.message = message;

    if (data) {
        error.data = data;
    }

    return error;
}

/**
 * Create PARSE ERROR JsonrpcError object
 */
export function createJsonrpcErrorParseError(): JsonrpcError {
    return createJsonrpcError(JSONRPC_PARSE_ERROR_CODE, JSONRPC_PARSE_ERROR_MESSAGE);
}

/**
 * Create INVALID REQUEST JsonrpcError object
 */
export function createJsonrpcErrorInvalidRequest(): JsonrpcError {
    return createJsonrpcError(JSONRPC_INVALID_REQUEST_CODE, JSONRPC_INVALID_REQUEST_MESSAGE);
}

/**
 * Create METHOD NOT FOUND JsonrpcError object
 */
export function createJsonrpcErrorMethodNotFound(): JsonrpcError {
    return createJsonrpcError(JSONRPC_METHOD_NOT_FOUND_CODE, JSONRPC_METHOD_NOT_FOUND_MESSAGE);
}

/**
 * Create INVALID PARAMS JsonrpcError object
 */
export function createJsonrpcErrorInvalidParams(): JsonrpcError {
    return createJsonrpcError(JSONRPC_INVALID_PARAMS_CODE, JSONRPC_INVALID_PARAMS_MESSAGE);
}

/**
 * Create INTERNAL ERROR JsonrpcError object
 */
export function createJsonrpcErrorInternalError(): JsonrpcError {
    return createJsonrpcError(JSONRPC_INTERNAL_ERROR_CODE, JSONRPC_INTERNAL_ERROR_MESSAGE);
}

/**
 * Create PARTIAL JsonrpcRequest object
 */
function createPartialJsonrpcRequest(method: string, params?: JsonrpcParams): Partial<JsonrpcRequest> {
    const request = Object.create(null) as Partial<JsonrpcRequest>;

    request.jsonrpc = JSONRPC_VERSION;
    request.method = method;

    if (params) {
        request.params = params;
    }

    return request;
}

/**
 * Create REQUEST JsonrpcRequest object
 */
export function createJsonrpcRequest(method: string, params?: JsonrpcParams, id?: JsonrpcID): JsonrpcRequest {
    const request = createPartialJsonrpcRequest(method, params) as JsonrpcRequest;

    request.id = typeof id === 'undefined' ? uuid() : id;

    return request;
}

/**
 * Create NOTIFICATION JsonrpcRequest object
 */
export function createJsonrpcNotification(method: string, params?: JsonrpcParams): JsonrpcRequest {
    return createPartialJsonrpcRequest(method, params) as JsonrpcRequest;
}

/**
 * Create SUCCESS JsonrpcResponse object
 */
export function createJsonrpcResponseSuccess(result: JsonrpcResult, id: JsonrpcID): JsonrpcResponse {
    const response = Object.create(null) as JsonrpcResponse;

    response.jsonrpc = JSONRPC_VERSION;
    response.result = result;
    response.id = id;

    return response;
}

/**
 * Create ERROR JsonrpcResponse object
 */
export function createJsonrpcResponseError(error: JsonrpcError, id: JsonrpcID): JsonrpcResponse {
    const response = Object.create(null) as JsonrpcResponse;

    response.jsonrpc = JSONRPC_VERSION;
    response.error = error;
    response.id = id;

    return response;
}

/**
 * Make RequestHandler that calls jsonrpc actions
 */
export function jsonrpcRouter(actions: object): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        console.log(req.cookies);
        console.log(req.body);

        const key = req.body.method || null;
        const id = req.body.id || null;

        if (actions[key]) {
            return actions[key](req, res, next);
        }

        res.json(createJsonrpcResponseError(createJsonrpcErrorMethodNotFound(), id));
    };
}
