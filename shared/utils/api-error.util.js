import { StatusCodes } from "http-status-codes"

export class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}


export const ApiErrorUtil = {
    badRequest(message = 'Bad request', errors = null) {
        return new ApiError(StatusCodes.BAD_REQUEST, message, errors)
    },

    unauthorized(message = 'Unauthorized') {
        return new ApiError(StatusCodes.UNAUTHORIZED, message)
    },

    forbidden(message = 'Forbidden') {
        return new ApiError(StatusCodes.FORBIDDEN, message)
    },

    notFound(message = 'Resource not found') {
        return new ApiError(StatusCodes.NOT_FOUND, message)
    },

    requestTimeout(message = 'Request timeout') {
        return new ApiError(StatusCodes.REQUEST_TIMEOUT, message)
    },

    conflict(message = 'Resource conflict') {
        return new ApiError(StatusCodes.CONFLICT, message)
    },

    internalServer(message = 'Internal server error') {
        return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message)
    },
}