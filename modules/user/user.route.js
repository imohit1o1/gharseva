import { Router } from "express"
import { authenticate, authorizeRoles, validate } from "../../shared/middlewares/index.middleware.js"
import { UserController } from "./user.controller.js"
import { UserValidator } from "./user.validator.js"
import { RoleConstants } from "../../constants.js"
import { CustomerBookingRouter } from "../service-booking/index.booking.js"
import { UserReviewRouter } from "../review/index.review.js"
import { UserAnalyticsController } from "./user-analytics.controller.js"

const router = Router()

// Auntheticated and authorized customer routes
router.use(authenticate)
router.use(authorizeRoles(RoleConstants.CUSTOMER))

router.get("/profile", UserController.getMe)

router.post("/profile/complete",
    validate(UserValidator.completeProfileSchema),
    UserController.completeProfile
)

router.put("/profile/update",
    validate(UserValidator.updateProfileSchema),
    UserController.updateProfile
)

// Booking routes
router.use("/bookings", CustomerBookingRouter)

// Review routes
router.use("/reviews", UserReviewRouter)

// Analytics
router.get("/analytics", UserAnalyticsController.getUserAnalytics)

export { router as UserRouter }
