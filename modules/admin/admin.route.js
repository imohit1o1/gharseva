import { Router } from "express"
import { authenticate, authorizeRoles } from "../../shared/middlewares/index.middleware.js"
import { RoleConstants } from "../../constants.js"
import { AdminServiceProviderRouter } from "./routes/admin-service-provider.route.js"
import { AdminUserRouter } from "./routes/admin-user.route.js"
import { AdminServiceCategoryRouter } from "./routes/admin-service-category.route.js"
import { AdminReviewRouter } from "./routes/admin-review.route.js"
import { AdminAnalyticsRouter } from "./routes/admin-analytics.route.js"

const router = Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorizeRoles(RoleConstants.ADMIN))

router.use("/users", AdminUserRouter)
router.use("/service-providers", AdminServiceProviderRouter)
router.use("/service-categories", AdminServiceCategoryRouter)
router.use("/reviews", AdminReviewRouter)
router.use("/analytics", AdminAnalyticsRouter)

export { router as AdminRouter }
