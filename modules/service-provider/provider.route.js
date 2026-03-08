import { Router } from "express"
import { authenticate, authorizeRoles, validate, requireApproval } from "../../shared/middlewares/index.middleware.js"
import { ProviderController } from "./provider.controller.js"
import { ProviderValidator } from "./provider.validator.js"
import { RoleConstants } from "../../constants.js"
import { ProviderBookingRouter } from "../service-booking/index.booking.js"
import { ProviderReviewRouter } from "../review/index.review.js"
import { ProviderAnalyticsController } from "./provider-analytics.controller.js"

const router = Router()

console.log("[provider.route.js] ✅ Router loaded and initialized")

// Authenticated users can fetch their own profile details (SERVICE_PROVIDER only)
router.get("/profile",
    authenticate,
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    ProviderController.getMe
)

// complete onboarding profile (SERVICE_PROVIDER only)
router.post("/profile",
    authenticate,
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    validate(ProviderValidator.completeProfileSchema),
    ProviderController.completeProfile
)

// update profile details (approved service provider only)
router.put("/profile",
    authenticate,
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    validate(ProviderValidator.updateProfileSchema),
    ProviderController.updateProfile
)

// toggle provider availability (approved service provider only)
router.patch("/profile/availability",
    authenticate,
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    validate(ProviderValidator.toggleAvailabilitySchema),
    ProviderController.toggleAvailability
)


// Provider booking routes
router.use("/bookings",
    authenticate,
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    ProviderBookingRouter)

// Provider review routes
router.use("/reviews",
    authenticate,
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    ProviderReviewRouter)

// Provider analytics (requireApproval attaches profileId)
router.get("/analytics",
    authenticate,
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    ProviderAnalyticsController.getProviderAnalytics
)



// fetch list of providers (customer only)
router.get("/list",
    (req, res, next) => {
        console.log("[provider.route.js] ✅ HIT /list route - query:", req.query)
        next()
    },
    validate(ProviderValidator.getAllProvidersSchema, "query"),
    ProviderController.getAllProviders
)

// fetch any provider profile (customer only)
router.get("/:id",
    validate(ProviderValidator.getProviderByIdSchema, "params"),
    ProviderController.getProviderById
)

export { router as ProviderRouter }
