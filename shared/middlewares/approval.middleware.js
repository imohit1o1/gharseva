import { ApiErrorUtil } from "../utils/index.utils.js"
import { RoleConstants } from "../../constants.js"
import { ServiceProviderProfileModel } from "../../modules/service-provider/service-provider-profile.model.js"
import { UserModel } from "../../modules/user/user.model.js"

/**
 * Middleware to check if a Service Provider is approved by an Admin.
 */
export const requireApproval = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(ApiErrorUtil.unauthorized("Authentication required"))
        }

        // If not a service provider, block access
        if (req.user.role !== RoleConstants.SERVICE_PROVIDER) {
            return next(ApiErrorUtil.forbidden("You are not authorized to access this resource"))
        }

        // Check if user exist or not
        const user = await UserModel.findById(req.user.userId)

        if (!user) {
            return next(ApiErrorUtil.notFound("User not found"))
        }

        if (!user.isProfileComplete) {
            return next(ApiErrorUtil.forbidden("You must complete your profile first"))
        }

        const providerProfile = await ServiceProviderProfileModel.findOne({ user_id: req.user.userId })

        if (!providerProfile) {
            return next(ApiErrorUtil.forbidden("Service provider profile not found"))
        }

        if (!providerProfile.is_approved) {
            return next(ApiErrorUtil.forbidden("Please wait for Admin approval."))
        }

        next()
    } catch (error) {
        next(ApiErrorUtil.internalServer("Error checking approval status"))
    }
}
