import { Router } from "express"
import { authenticate, authorizeRoles, validate } from "../../shared/middlewares/index.middleware.js"
import { UserController } from "./user.controller.js"
import { UserValidator } from "./user.validator.js"
import { RoleConstants } from "../../constants.js"
import { CustomerBookingRouter } from "../service-booking/index.booking.js"

const router = Router()

// Auntheticated and authorized customer routes
router.use(authenticate)
router.use(authorizeRoles(RoleConstants.CUSTOMER))

router.get("/me", UserController.getMe)

router.post("/profile",
    validate(UserValidator.completeProfileSchema),
    UserController.completeProfile
)

router.put("/profile",
    validate(UserValidator.updateProfileSchema),
    UserController.updateProfile
)

// Booking routes
router.use("/bookings", CustomerBookingRouter)

export { router as UserRouter }
