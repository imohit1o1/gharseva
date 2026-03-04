import { Router } from "express"
import { authenticate, validate } from "../../shared/middlewares/index.middleware.js"
import { UserController } from "./user.controller.js"
import { UserValidator } from "./user.validator.js"

const router = Router()

// All user routes are protected
router.use(authenticate)

router.get("/me", UserController.getMe)

router.post("/profile",
    validate(UserValidator.completeProfileSchema),
    UserController.completeProfile
)

router.put("/profile",
    validate(UserValidator.updateProfileSchema),
    UserController.updateProfile
)

export { router as UserRouter }
