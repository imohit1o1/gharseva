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
        this.success = false;
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
        return new ApiError(400, message, errors);
    },

    notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    },

    requestTimeout(message = 'Request timeout') {
        return new ApiError(408, message);
    },

    conflict(message = 'Resource conflict') {
        return new ApiError(409, message);
    },

    internalServer(message = 'Internal server error') {
        return new ApiError(500, message);
    },
};