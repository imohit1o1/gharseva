import { StatusCodes } from "http-status-codes"
import { AdminService } from "./admin.service.js"
import { ReviewService } from "../review/review.service.js"
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

export const updateProvider = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.updateProvider(req.params.providerId, req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "Service provider updated successfully", data)
})

export const deleteProvider = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.deleteProvider(req.params.providerId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Service provider deleted successfully", data)
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

export const updateUser = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.updateUser(req.params.userId, req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "User updated successfully", data)
})

export const deleteUser = AsyncHandlerUtil(async (req, res) => {
    const data = await AdminService.deleteUser(req.params.userId)
    ApiResponseUtil.send(res, StatusCodes.OK, "User deleted successfully", data)
})

// ===================== REVIEWS =====================

export const getAllReviews = AsyncHandlerUtil(async (req, res) => {
    const data = await ReviewService.getAllReviews(req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Reviews fetched successfully", data)
})

export const hideReview = AsyncHandlerUtil(async (req, res) => {
    const data = await ReviewService.hideReview(req.user.userId, req.params.reviewId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Review hidden successfully", data)
})

export const showReview = AsyncHandlerUtil(async (req, res) => {
    const data = await ReviewService.showReview(req.user.userId, req.params.reviewId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Review made visible successfully", data)
})

export const deleteReview = AsyncHandlerUtil(async (req, res) => {
    await ReviewService.deleteReview(req.params.reviewId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Review deleted successfully", null)
})

export const AdminController = {
    getProviders,
    getProviderById,
    approveProvider,
    rejectProvider,
    updateProvider,
    deleteProvider,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllReviews,
    hideReview,
    showReview,
    deleteReview
}
