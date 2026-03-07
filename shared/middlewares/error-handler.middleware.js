import { ApiError, LoggerUtil } from "../utils/index.utils.js"
import { config } from "../../config/config.js"

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    let statusCode = err instanceof ApiError ? err.statusCode : 500
    let message = err instanceof ApiError ? err.message : "Internal server error"
    let errors = err instanceof ApiError ? err.errors : []

    // Multer Error Handling
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            statusCode = 413 // Payload Too Large
            message = "File is too large. Max allowed size is 5MB"
        } else {
            statusCode = 400
            message = `Upload error: ${err.message}`
        }
    }

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
