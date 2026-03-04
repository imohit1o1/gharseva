import { ApiError, LoggerUtil } from "../utils/index.utils.js"
import { config } from "../../config/config.js"

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    const statusCode = err instanceof ApiError ? err.statusCode : 500
    const message = err instanceof ApiError ? err.message : "Internal server error"
    const errors = err instanceof ApiError ? err.errors : []

    if (statusCode >= 500) {
        LoggerUtil.error(`[${req.method}] ${req.originalUrl} → ${err.message}`, {
            stack: err.stack
        })
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors: errors?.length ? errors : undefined,
        ...(config.app.env === "development" && { stack: err.stack })
    })
}
