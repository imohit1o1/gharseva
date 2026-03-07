import { StatusCodes } from "http-status-codes"
import { AnalyticsService } from "./analytics.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

export const getOverview = AsyncHandlerUtil(async (req, res) => {
    const data = await AnalyticsService.getOverview()
    ApiResponseUtil.send(res, StatusCodes.OK, "Overview analytics fetched successfully", data)
})

export const getBookingAnalytics = AsyncHandlerUtil(async (req, res) => {
    const data = await AnalyticsService.getBookingAnalytics()
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking analytics fetched successfully", data)
})

export const getRevenueAnalytics = AsyncHandlerUtil(async (req, res) => {
    const data = await AnalyticsService.getRevenueAnalytics()
    ApiResponseUtil.send(res, StatusCodes.OK, "Revenue analytics fetched successfully", data)
})

export const getProviderAnalytics = AsyncHandlerUtil(async (req, res) => {
    const data = await AnalyticsService.getProviderAnalytics()
    ApiResponseUtil.send(res, StatusCodes.OK, "Provider analytics fetched successfully", data)
})

export const getUserAnalytics = AsyncHandlerUtil(async (req, res) => {
    const data = await AnalyticsService.getUserAnalytics()
    ApiResponseUtil.send(res, StatusCodes.OK, "User analytics fetched successfully", data)
})

export const AnalyticsController = {
    getOverview,
    getBookingAnalytics,
    getRevenueAnalytics,
    getProviderAnalytics,
    getUserAnalytics
}
