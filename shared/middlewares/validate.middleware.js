import { ApiError } from "../utils/index.utils.js"

/**
 * Validation middleware
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
        console.log("Validation Error:", JSON.stringify(result.error.issues, null, 2))
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }))
        return next(new ApiError(400, "Validation failed", errors))
    }

    req.body = result.data
    next()
}
