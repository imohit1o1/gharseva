import { BookingModel } from "../service-booking/booking.model.js"
import { ReviewModel } from "../review/review.model.js"
import { ServiceProviderProfileModel } from "../service-provider/service-provider-profile.model.js"
import { UserModel } from "../user/user.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { BookingStatusConstants, RoleConstants } from "../../constants.js"

const getOverview = async () => {
    try {
        const [
            totalUsers,
            totalProviders,
            totalApprovedProviders,
            totalBookings,
            totalCompletedBookings,
            totalCancelledBookings,
            totalReviews,
        ] = await Promise.all([
            UserModel.countDocuments({ role: RoleConstants.CUSTOMER }),
            ServiceProviderProfileModel.countDocuments(),
            ServiceProviderProfileModel.countDocuments({ is_approved: true }),
            BookingModel.countDocuments(),
            BookingModel.countDocuments({ status: BookingStatusConstants.COMPLETED }),
            BookingModel.countDocuments({ status: BookingStatusConstants.CANCELLED }),
            ReviewModel.countDocuments(),
        ])

        const revenue = await BookingModel.aggregate([
            { $match: { status: BookingStatusConstants.COMPLETED } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ])

        return {
            totalUsers,
            totalProviders,
            totalApprovedProviders,
            totalBookings,
            totalCompletedBookings,
            totalCancelledBookings,
            totalReviews,
            totalRevenue: revenue[0]?.total ?? 0
        }
    } catch (error) {
        LoggerUtil.error("Error in AnalyticsService.getOverview", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching overview analytics")
    }
}

const getBookingAnalytics = async () => {
    try {
        // Bookings grouped by status
        const byStatus = await BookingModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ])

        // Bookings per month (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const byMonth = await BookingModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        return { byStatus, byMonth }
    } catch (error) {
        LoggerUtil.error("Error in AnalyticsService.getBookingAnalytics", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching booking analytics")
    }
}

const getRevenueAnalytics = async () => {
    try {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        // Revenue per month (last 6 months, completed bookings only)
        const byMonth = await BookingModel.aggregate([
            { $match: { status: BookingStatusConstants.COMPLETED, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    revenue: { $sum: "$price" },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        const total = await BookingModel.aggregate([
            { $match: { status: BookingStatusConstants.COMPLETED } },
            { $group: { _id: null, revenue: { $sum: "$price" }, bookings: { $sum: 1 } } }
        ])

        return {
            totalRevenue: total[0]?.revenue ?? 0,
            totalCompletedBookings: total[0]?.bookings ?? 0,
            byMonth
        }
    } catch (error) {
        LoggerUtil.error("Error in AnalyticsService.getRevenueAnalytics", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching revenue analytics")
    }
}

const getProviderAnalytics = async () => {
    try {
        const [total, approved, pending, available] = await Promise.all([
            ServiceProviderProfileModel.countDocuments(),
            ServiceProviderProfileModel.countDocuments({ is_approved: true }),
            ServiceProviderProfileModel.countDocuments({ is_approved: false }),
            ServiceProviderProfileModel.countDocuments({ is_approved: true, is_available: true }),
        ])

        // Top providers by completed bookings
        const topProviders = await BookingModel.aggregate([
            { $match: { status: BookingStatusConstants.COMPLETED } },
            { $group: { _id: "$service_provider_id", completedBookings: { $sum: 1 }, revenue: { $sum: "$price" } } },
            { $sort: { completedBookings: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "serviceproviderprofiles",
                    localField: "_id",
                    foreignField: "_id",
                    as: "profile"
                }
            },
            { $unwind: "$profile" },
            {
                $project: {
                    completedBookings: 1,
                    revenue: 1,
                    "profile.city": 1,
                    "profile.area": 1,
                    "profile.base_price": 1
                }
            }
        ])

        return { total, approved, pending, available, topProviders }
    } catch (error) {
        LoggerUtil.error("Error in AnalyticsService.getProviderAnalytics", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching provider analytics")
    }
}

export const AnalyticsService = {
    getOverview,
    getBookingAnalytics,
    getRevenueAnalytics,
    getProviderAnalytics
}
