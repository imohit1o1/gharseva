import { ReviewModel } from "./review.model.js"
import { BookingModel } from "../service-booking/booking.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { BookingStatusConstants, PagintationConstants, ReviewStatusConstants } from "../../constants.js"

// ===================== USER METHODS =====================

const createReview = async (userId, bookingId, data) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId })
        if (!booking) {
            throw ApiErrorUtil.notFound("Booking not found")
        }

        if (booking.status !== BookingStatusConstants.COMPLETED) {
            throw ApiErrorUtil.badRequest("You can only review completed bookings")
        }

        const existingReview = await ReviewModel.findOne({ booking_id: bookingId })
        if (existingReview) {
            throw ApiErrorUtil.conflict("A review already exists for this booking")
        }

        const review = await ReviewModel.create({
            booking_id: bookingId,
            user_id: userId,
            service_provider_id: booking.service_provider_id,
            rating: data.rating,
            review: data.review,
            status: ReviewStatusConstants.VISIBLE
        })

        LoggerUtil.info(`Review created by user ${userId} for booking ${bookingId}`)
        return review
    } catch (error) {
        LoggerUtil.error("Error in ReviewService.createReview", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error creating review")
    }
}

const getUserReviews = async (userId, queryFilters = {}) => {
    try {
        const { page = PagintationConstants.PAGE, limit = PagintationConstants.LIMIT } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const filter = { user_id: userId }

        const reviews = await ReviewModel.find(filter)
            .populate("service_provider_id", "city area base_price category_id")
            .populate("booking_id", "schedule_at")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await ReviewModel.countDocuments(filter)

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in ReviewService.getUserReviews", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching reviews")
    }
}

// ===================== PROVIDER METHODS =====================

const getProviderReviews = async (providerProfileId, queryFilters = {}) => {
    try {
        const { page = PagintationConstants.PAGE, limit = PagintationConstants.LIMIT } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const filter = {
            service_provider_id: providerProfileId,
            status: ReviewStatusConstants.VISIBLE
        }

        const reviews = await ReviewModel.find(filter)
            .populate("user_id", "display_name")
            .populate("booking_id", "schedule_at")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await ReviewModel.countDocuments(filter)

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in ReviewService.getProviderReviews", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching provider reviews")
    }
}

// ===================== ADMIN METHODS =====================

const getAllReviews = async (queryFilters = {}) => {
    try {
        const { page = PagintationConstants.PAGE, limit = PagintationConstants.LIMIT } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const reviews = await ReviewModel.find()
            .populate("user_id", "display_name email")
            .populate("service_provider_id", "city area category_id")
            .populate("booking_id", "schedule_at")
            .populate("moderated_by", "display_name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await ReviewModel.countDocuments()

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in ReviewService.getAllReviews", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching reviews")
    }
}

const hideReview = async (adminId, reviewId) => {
    try {
        const review = await ReviewModel.findByIdAndUpdate(
            reviewId,
            { $set: { status: ReviewStatusConstants.HIDDEN, moderated_by: adminId } },
            { new: true }
        )

        if (!review) throw ApiErrorUtil.notFound("Review not found")

        LoggerUtil.info(`Review ${reviewId} hidden by admin ${adminId}`)
        return review
    } catch (error) {
        LoggerUtil.error("Error in ReviewService.hideReview", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error hiding review")
    }
}

const showReview = async (adminId, reviewId) => {
    try {
        const review = await ReviewModel.findByIdAndUpdate(
            reviewId,
            { $set: { status: ReviewStatusConstants.VISIBLE, moderated_by: adminId } },
            { new: true }
        )

        if (!review) throw ApiErrorUtil.notFound("Review not found")

        LoggerUtil.info(`Review ${reviewId} set visible by admin ${adminId}`)
        return review
    } catch (error) {
        LoggerUtil.error("Error in ReviewService.showReview", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error showing review")
    }
}

const deleteReview = async (reviewId) => {
    try {
        const review = await ReviewModel.findByIdAndDelete(reviewId)

        if (!review) throw ApiErrorUtil.notFound("Review not found")

        LoggerUtil.info(`Review ${reviewId} deleted`)
        return null
    } catch (error) {
        LoggerUtil.error("Error in ReviewService.deleteReview", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error deleting review")
    }
}

export const ReviewService = {
    // User
    createReview,
    getUserReviews,
    // Provider
    getProviderReviews,
    // Admin
    getAllReviews,
    hideReview,
    showReview,
    deleteReview
}
