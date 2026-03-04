import { Router } from "express"
import { authenticate, validate } from "../../shared/middlewares/index.middleware.js"
import { AuthValidator } from "./auth.validator.js"
import { AuthController } from "./auth.controller.js"

const router = Router()

// Public routes
router.post("/register",
    validate(AuthValidator.registerSchema),
    AuthController.register
)
router.post("/login",
    validate(AuthValidator.loginSchema),
    AuthController.login
)

// Protected routes
router.post("/refresh-token",
    authenticate,
    AuthController.refreshToken
)

export { router as AuthRouter }
