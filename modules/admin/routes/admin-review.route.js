import { Router } from "express"
import { validate } from "../../../shared/middlewares/index.middleware.js"
import { AdminController } from "../admin.controller.js"
import { ReviewValidator } from "../../review/review.validator.js"

const router = Router()

router.get("/", validate(ReviewValidator.listReviewsQuerySchema, "query"), AdminController.getAllReviews)
router.patch("/:reviewId/hide", validate(ReviewValidator.reviewIdSchema, "params"), AdminController.hideReview)
router.patch("/:reviewId/show", validate(ReviewValidator.reviewIdSchema, "params"), AdminController.showReview)
router.delete("/:reviewId", validate(ReviewValidator.reviewIdSchema, "params"), AdminController.deleteReview)

export { router as AdminReviewRouter }
