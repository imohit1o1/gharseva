import { Router } from "express"
import { authenticate, authorizeRoles, validate } from "../../../shared/middlewares/index.middleware.js"
import { UserReviewController } from "../review.controller.js"
import { ReviewValidator } from "../review.validator.js"
import { RoleConstants } from "../../../constants.js"

const router = Router()

router.use(authenticate)
router.use(authorizeRoles(RoleConstants.CUSTOMER))

router.get("/", validate(ReviewValidator.listReviewsQuerySchema, "query"), UserReviewController.getUserReviews)
router.post("/bookings/:bookingId/review",
    validate(ReviewValidator.bookingIdParamSchema, "params"),
    validate(ReviewValidator.createReviewSchema),
    UserReviewController.createReview
)

export { router as UserReviewRouter }
