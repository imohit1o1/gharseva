import { Router } from "express"
import { authenticate, authorizeRoles, validate, requireApproval } from "../../shared/middlewares/index.middleware.js"
import { ProviderController } from "./provider.controller.js"
import { ProviderValidator } from "./provider.validator.js"
import { RoleConstants } from "../../constants.js"

const router = Router()

// =================== Aunthenticated and Authorized Service Provider routes
router.use(authenticate)
router.use(authorizeRoles(RoleConstants.SERVICE_PROVIDER))

// get profile details
router.get("/me", ProviderController.getMe)

// complete onboarding profile
router.post("/profile",
    validate(ProviderValidator.completeProfileSchema),
    ProviderController.completeProfile
)

// =================== Approved Service Provider routes ===================
router.use(requireApproval);

// update profile details
router.put("/profile",
    validate(ProviderValidator.updateProfileSchema),
    ProviderController.updateProfile
)

export { router as ProviderRouter }
