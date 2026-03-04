import { PagintationConstants } from "../../constants.js"

export const ApiResponseUtil = {
    /**
     * Utility for creating consistent API responses
     * @param {Object} res - Express response object
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Response message
     * @param {*} data - Response data
     * @param {Object} pagination - Optional pagination object
     */
    send(res, statusCode, message, data = null, pagination = null) {
        const response = {
            success: statusCode < 400,
            message,
            data,
            timestamp: new Date().toISOString(),
        }

        if (pagination) {
            response.pagination = {
                page: pagination.page || PagintationConstants.PAGE,
                limit: pagination.limit || PagintationConstants.LIMIT,
                total: pagination.total || PagintationConstants.TOTAL,
                totalPages: pagination.totalPages || PagintationConstants.TOTAL_PAGES,
            }
        }

        return res.status(statusCode).json(response)
    },
}


