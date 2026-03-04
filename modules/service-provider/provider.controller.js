import { StatusCodes } from "http-status-codes"
import { ProviderService } from "./provider.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

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

export const ProviderController = {
    getMe,
    completeProfile,
    updateProfile
}
