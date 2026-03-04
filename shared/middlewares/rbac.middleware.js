import { ApiErrorUtil } from "../utils/index.utils.js"
import { RoleConstants } from "../../constants.js"

export const authorizeRoles = (...allowedRoles) => {

    if (!allowedRoles.length) {
        throw new Error("authorizeRoles requires at least one role")
    }

    return (req, res, next) => {

        if (!req.user) {
            return next(ApiErrorUtil.unauthorized("Authentication required"))
        }

        const { role } = req.user

        if (!allowedRoles.includes(role)) {
            return next(
                ApiErrorUtil.forbidden("You do not have permission to access this resource")
            )
        }

        next()
    }
}