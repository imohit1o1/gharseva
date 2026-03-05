import { BookingModel } from "../service-booking/booking.model.js"
import { ReviewModel } from "../review/review.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { BookingStatusConstants } from "../../constants.js"

const getUserAnalytics = async (userId) => {
    try {
        const [
            totalBookings,
            completedBookings,
            cancelledBookings,
            pendingBookings
        ] = await Promise.all([
            BookingModel.countDocuments({ user_id: userId }),
            BookingModel.countDocuments({ user_id: userId, status: BookingStatusConstants.COMPLETED }),
            BookingModel.countDocuments({ user_id: userId, status: BookingStatusConstants.CANCELLED }),
            BookingModel.countDocuments({ user_id: userId, status: BookingStatusConstants.PENDING })
        ])

        // Total amount spent on completed bookings
        const spendAgg = await BookingModel.aggregate([
            { $match: { user_id: userId, status: BookingStatusConstants.COMPLETED } },
            { $group: { _id: null, totalSpent: { $sum: "$price" } } }
        ])

        // Reviews submitted by the user
        const totalReviews = await ReviewModel.countDocuments({ user_id: userId })

        // Bookings per month (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const bookingsByMonth = await BookingModel.aggregate([
            { $match: { user_id: userId, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        return {
            totalBookings,
            completedBookings,
            cancelledBookings,
            pendingBookings,
            totalSpent: spendAgg[0]?.totalSpent ?? 0,
            totalReviews,
            bookingsByMonth
        }
    } catch (error) {
        LoggerUtil.error("Error in UserAnalyticsService.getUserAnalytics", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching user analytics")
    }
}

export const UserAnalyticsService = { getUserAnalytics }
