import { StatusCodes } from "http-status-codes"
import { ProviderAnalyticsService } from "./provider-analytics.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

export const getProviderAnalytics = AsyncHandlerUtil(async (req, res) => {
    // req.user.profileId is attached by requireApproval middleware
    const data = await ProviderAnalyticsService.getProviderAnalytics(req.user.profileId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Provider analytics fetched successfully", data)
})

export const ProviderAnalyticsController = { getProviderAnalytics }
