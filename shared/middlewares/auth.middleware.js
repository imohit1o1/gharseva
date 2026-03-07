import { ApiError, JwtUtil } from "../utils/index.utils.js"

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(new ApiError(401, "Authorization header missing"));
        };

        if (!authHeader.startsWith("Bearer ")) {
            return next(new ApiError(401, "Invalid authorization format"));
        };

        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(new ApiError(401, "Token not provided"));
        }
        const decoded = JwtUtil.verifyToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Token has expired. Please log in again."));
        }
        if (error.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Invalid token. Please log in again."));
        }
        next(error);
    }
}