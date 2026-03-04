import { Router } from "express"
import { authenticate, authorizeRoles, validate, requireApproval } from "../../../shared/middlewares/index.middleware.js"
import { ProviderReviewController } from "../review.controller.js"
import { ReviewValidator } from "../review.validator.js"
import { RoleConstants } from "../../../constants.js"

const router = Router()

router.use(authenticate)
router.use(authorizeRoles(RoleConstants.SERVICE_PROVIDER))
router.use(requireApproval)

router.get("/", validate(ReviewValidator.listReviewsQuerySchema, "query"), ProviderReviewController.getProviderReviews)

export { router as ProviderReviewRouter }
