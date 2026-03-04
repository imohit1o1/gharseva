import { StatusCodes } from "http-status-codes"
import { UserService } from "./user.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

export const getMe = AsyncHandlerUtil(async (req, res) => {
    const data = await UserService.getMe(req.user.userId)
    ApiResponseUtil.send(res, StatusCodes.OK, "User profile fetched successfully", data)
})

export const completeProfile = AsyncHandlerUtil(async (req, res) => {
    const data = await UserService.completeProfile(req.user.userId, req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "Profile completed successfully", data)
})

export const updateProfile = AsyncHandlerUtil(async (req, res) => {
    const data = await UserService.updateProfile(req.user.userId, req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "Profile updated successfully", data)
})

export const UserController = {
    getMe,
    completeProfile,
    updateProfile
}
