import bodyParser from 'body-parser';
import {
    ErrorRequestHandler,
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
const JSONRPC_ID_NULL = null;
const JSONRPC_ID_UNDEFINED_MESSAGE = 'No ID';

const JSONRPC_FIELD_NAME_JSONRPC = 'jsonrpc';
const JSONRPC_FIELD_NAME_METHOD = 'method';
const JSONRPC_FIELD_NAME_PARAMS = 'params';
const JSONRPC_FIELD_NAME_ID = 'id';
const JSONRPC_FIELD_NAME_RESULT = 'result';
const JSONRPC_FIELD_NAME_ERROR = 'error';

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
export function createJsonrpcErrorInternalError(data?: JsonrpcErrorData): JsonrpcError {
    return createJsonrpcError(JSONRPC_INTERNAL_ERROR_CODE, JSONRPC_INTERNAL_ERROR_MESSAGE, data);
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
 * Create PARTIAL JsonrpcResponse object
 */
function createPartialJsonrpcResponse(id: JsonrpcID): Partial<JsonrpcResponse> {
    const response = Object.create(null) as JsonrpcResponse;

    if (typeof id === 'undefined') {
        throw Error(JSONRPC_ID_UNDEFINED_MESSAGE);
    }

    response.jsonrpc = JSONRPC_VERSION;
    response.id = id;

    return response;
}

/**
 * Create SUCCESS JsonrpcResponse object
 */
export function createJsonrpcResponseSuccess(result: JsonrpcResult, id: JsonrpcID): JsonrpcResponse {
    const response = createPartialJsonrpcResponse(id) as JsonrpcResponse;
    response.result = result;

    return response;
}

/**
 * Create ERROR JsonrpcResponse object
 */
export function createJsonrpcResponseError(error: JsonrpcError, id: JsonrpcID): JsonrpcResponse {
    const response = createPartialJsonrpcResponse(id) as JsonrpcResponse;
    response.error = error;

    return response;
}

/**
 * Parse body object to valid jsonrpc format or return null
 */
export function jsonrpcParseBody(body: object): JsonrpcRequest | null {
    if (!body[JSONRPC_FIELD_NAME_JSONRPC] || body[JSONRPC_FIELD_NAME_JSONRPC] !== JSONRPC_VERSION) return null;
    if (!body[JSONRPC_FIELD_NAME_METHOD]) return null;

    const request = createPartialJsonrpcRequest(body[JSONRPC_FIELD_NAME_METHOD]);

    if (body[JSONRPC_FIELD_NAME_PARAMS]) request.params = body[JSONRPC_FIELD_NAME_PARAMS];
    if (body[JSONRPC_FIELD_NAME_ID]) request.id = body[JSONRPC_FIELD_NAME_ID];

    return request as JsonrpcRequest;
}

/**
 * Handle errors when parsing json in top level middleware
 */
export function jsonrpcErrorHandler(err: object, req: Request, res: Response, next: NextFunction): void {
    if (err) {
        res.json(createJsonrpcResponseError(
            createJsonrpcErrorParseError(),
            JSONRPC_ID_NULL
        ));

        return;
    }

    next();
}

/**
 * Handle requests
 */
function createJsonrpcRequestHandler(actions: object): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const request = jsonrpcParseBody(req.body);

        if (!request) {
            res.json(createJsonrpcResponseError(
                createJsonrpcErrorInvalidRequest(),
                JSONRPC_ID_NULL
            ));

            return;
        }

        if (actions[request.method]) {
            try {
                req.body = request;
                actions[request.method](req, res, next);
            } catch (e) {
                res.json(createJsonrpcResponseError(
                    createJsonrpcErrorInternalError(e.message),
                    request.id || JSONRPC_ID_NULL
                ));
            }

            return;
        }

        res.json(createJsonrpcResponseError(
            createJsonrpcErrorMethodNotFound(),
            request.id || JSONRPC_ID_NULL
        ));
    };
}

/**
 * Make RequestHandler that calls jsonrpc actions
 */
export function jsonrpcRouter(actions: object): Array<RequestHandler | ErrorRequestHandler> {
    return [
        bodyParser.json(),
        jsonrpcErrorHandler,
        createJsonrpcRequestHandler(actions)
    ];
}
