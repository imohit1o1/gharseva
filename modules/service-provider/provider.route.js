import { Router } from "express"
import { authenticate, authorizeRoles, validate, requireApproval } from "../../shared/middlewares/index.middleware.js"
import { ProviderController } from "./provider.controller.js"
import { ProviderValidator } from "./provider.validator.js"
import { RoleConstants } from "../../constants.js"
import { ProviderBookingRouter } from "../service-booking/index.booking.js"
import { ProviderReviewRouter } from "../review/index.review.js"
import { ProviderAnalyticsController } from "./provider-analytics.controller.js"

const router = Router()

// Authenticated users only
router.use(authenticate)

// Authenticated users can fetch their own profile details (SERVICE_PROVIDER only)
router.get("/profile",
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    ProviderController.getMe
)

// complete onboarding profile (SERVICE_PROVIDER only)
router.post("/profile",
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    validate(ProviderValidator.completeProfileSchema),
    ProviderController.completeProfile
)

// update profile details (approved service provider only)
router.put("/profile",
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    validate(ProviderValidator.updateProfileSchema),
    ProviderController.updateProfile
)

// toggle provider availability (approved service provider only)
router.patch("/profile/availability",
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    validate(ProviderValidator.toggleAvailabilitySchema),
    ProviderController.toggleAvailability
)


// Provider booking routes
router.use("/bookings", ProviderBookingRouter)

// Provider review routes
router.use("/reviews", ProviderReviewRouter)

// Provider analytics (requireApproval attaches profileId)
router.get("/analytics",
    authorizeRoles(RoleConstants.SERVICE_PROVIDER),
    requireApproval,
    ProviderAnalyticsController.getProviderAnalytics
)




// fetch list of providers (customer only)
router.get("/",
    authorizeRoles(RoleConstants.CUSTOMER),
    validate(ProviderValidator.getAllProvidersSchema, "query"),
    ProviderController.getAllProviders
)

// fetch any provider profile (customer only)
router.get("/:id",
    authorizeRoles(RoleConstants.CUSTOMER),
    validate(ProviderValidator.getProviderByIdSchema, "params"),
    ProviderController.getProviderById
)
export { router as ProviderRouter }
