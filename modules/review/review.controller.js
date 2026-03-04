import { StatusCodes } from "http-status-codes"
import { ReviewService } from "./review.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

// ===================== USER =====================

export const createReview = AsyncHandlerUtil(async (req, res) => {
    const data = await ReviewService.createReview(req.user.userId, req.params.bookingId, req.body)
    ApiResponseUtil.send(res, StatusCodes.CREATED, "Review submitted successfully", data)
})

export const getUserReviews = AsyncHandlerUtil(async (req, res) => {
    const data = await ReviewService.getUserReviews(req.user.userId, req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Reviews fetched successfully", data)
})

export const UserReviewController = { createReview, getUserReviews }

// ===================== PROVIDER =====================

export const getProviderReviews = AsyncHandlerUtil(async (req, res) => {
    const data = await ReviewService.getProviderReviews(req.user.profileId, req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Reviews fetched successfully", data)
})

export const ProviderReviewController = { getProviderReviews }