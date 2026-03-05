import { StatusCodes } from "http-status-codes"
import { UserAnalyticsService } from "./user-analytics.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

export const getUserAnalytics = AsyncHandlerUtil(async (req, res) => {
    const data = await UserAnalyticsService.getUserAnalytics(req.user.userId)
    ApiResponseUtil.send(res, StatusCodes.OK, "User analytics fetched successfully", data)
})

export const UserAnalyticsController = { getUserAnalytics }
