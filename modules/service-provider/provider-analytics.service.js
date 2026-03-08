import { BookingModel } from "../service-booking/booking.model.js"
import { ReviewModel } from "../review/review.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { BookingStatusConstants } from "../../constants.js"
import mongoose from "mongoose"

const getProviderAnalytics = async (providerProfileId) => {
    try {
        const profileObjectId = new mongoose.Types.ObjectId(providerProfileId)

        const [
            totalBookings,
            completedBookings,
            cancelledBookings,
            pendingBookings,
            activeBookings
        ] = await Promise.all([
            BookingModel.countDocuments({ service_provider_id: profileObjectId }),
            BookingModel.countDocuments({ service_provider_id: profileObjectId, status: BookingStatusConstants.COMPLETED }),
            BookingModel.countDocuments({ service_provider_id: profileObjectId, status: BookingStatusConstants.CANCELLED }),
            BookingModel.countDocuments({ service_provider_id: profileObjectId, status: BookingStatusConstants.PENDING }),
            BookingModel.countDocuments({ service_provider_id: profileObjectId, status: BookingStatusConstants.IN_PROGRESS })
        ])

        // Total revenue from completed bookings
        const revenueAgg = await BookingModel.aggregate([
            { $match: { service_provider_id: profileObjectId, status: BookingStatusConstants.COMPLETED } },
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
        ])

        // Average rating (visible reviews only)
        const ratingAgg = await ReviewModel.aggregate([
            { $match: { service_provider_id: profileObjectId, is_hidden: false } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ])

        // Bookings per month (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const bookingsByMonth = await BookingModel.aggregate([
            {
                $match: {
                    service_provider_id: profileObjectId,
                    createdAt: { $gte: sixMonthsAgo },
                    status: BookingStatusConstants.COMPLETED
                }
            },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$price" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        return {
            totalBookings,
            completedBookings,
            cancelledBookings,
            pendingBookings,
            activeBookings,
            totalRevenue: revenueAgg[0]?.totalRevenue ?? 0,
            averageRating: ratingAgg[0]?.avgRating ? parseFloat(ratingAgg[0].avgRating.toFixed(2)) : null,
            totalReviews: ratingAgg[0]?.totalReviews ?? 0,
            bookingsByMonth
        }
    } catch (error) {
        LoggerUtil.error("Error in ProviderAnalyticsService.getProviderAnalytics", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching provider analytics")
    }
}

export const ProviderAnalyticsService = { getProviderAnalytics }
