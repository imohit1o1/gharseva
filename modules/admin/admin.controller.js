import { StatusCodes } from "http-status-codes"
import { AdminService } from "./admin.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

// ===================== SERVICE PROVIDERS =====================

export const getProviders = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.getProviders(req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Service providers fetched successfully", data)
})

export const getProviderById = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.getProviderById(req.params.providerId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Service provider fetched successfully", data)
})

export const approveProvider = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.approveProvider(req.user.userId, req.params.providerId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Service provider approved successfully", data)
})

export const rejectProvider = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.rejectProvider(req.user.userId, req.params.providerId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Service provider rejected successfully", data)
})

// ===================== USERS =====================

export const getUsers = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.getUsers(req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Users fetched successfully", data)
})

export const getUserById = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.getUserById(req.params.userId)
    ApiResponseUtil.send(res, StatusCodes.OK, "User fetched successfully", data)
})

export const getUserProfile = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.getUserProfile(req.params.userId)
    ApiResponseUtil.send(res, StatusCodes.OK, "User profile fetched successfully", data)
})

export const AdminController = {
    getProviders,
    getProviderById,
    approveProvider,
    rejectProvider,
    getUsers,
    getUserById,
    getUserProfile
}
