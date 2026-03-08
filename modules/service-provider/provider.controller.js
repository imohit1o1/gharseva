import { StatusCodes } from "http-status-codes"
import { ProviderService } from "./provider.service.js"
import { AsyncHandlerUtil, ApiResponseUtil, ApiErrorUtil } from "../../shared/utils/index.utils.js"
import { RoleConstants } from "../../constants.js"

export const getMe = AsyncHandlerUtil(async (req, res) => {
    const data = await ProviderService.getMe(req.user.userId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Provider profile fetched successfully", data)
})

export const completeProfile = AsyncHandlerUtil(async (req, res) => {
    const data = await ProviderService.completeProfile(req.user.userId, req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "Provider profile completed successfully", data)
})

export const updateProfile = AsyncHandlerUtil(async (req, res) => {
    const data = await ProviderService.updateProfile(req.user.userId, req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "Provider profile updated successfully", data)
})

export const toggleAvailability = AsyncHandlerUtil(async (req, res) => {
    const data = await ProviderService.toggleAvailability(req.user.userId, req.body.is_available)
    ApiResponseUtil.send(res, StatusCodes.OK, "Provider availability updated successfully", data)
})


export const getAllProviders = AsyncHandlerUtil(async (req, res) => {
    // Only approved providers are visible on the marketplace for customers, providers, and guest users.
    if (!req.user || req.user.role !== RoleConstants.ADMIN) {
        req.query.is_approved = true
    }

    const data = await ProviderService.getAllProviders(req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Service providers list fetched successfully", data)
})

// Internal method - used by admin controller (returns ALL providers including unapproved)
async function getAllProvidersInternal(queryFilters = {}) {
    return await ProviderService.getAllProvidersForAdmin(queryFilters)
}

export const getProviderById = AsyncHandlerUtil(async (req, res) => {
    const data = await ProviderService.getProviderById(req.params.id)

    // Only approved providers are visible on the marketplace for customers, providers, and guest users.
    const isRestrictedRole = !req.user || req.user.role !== RoleConstants.ADMIN
    if (isRestrictedRole && !data.is_approved) {
        throw ApiErrorUtil.notFound("Provider is not available or not approved")
    }

    ApiResponseUtil.send(res, StatusCodes.OK, "Provider profile fetched successfully", data)
})

export const ProviderController = {
    getMe,
    completeProfile,
    updateProfile,
    toggleAvailability,
    getAllProviders,
    getProviderById,
    getAllProvidersInternal
}
