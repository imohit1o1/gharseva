import { Router } from "express"
import { AnalyticsController } from "../analytics.controller.js"

const router = Router()

// Auth is applied by parent admin.route.js
router.get("/overview", AnalyticsController.getOverview)
router.get("/bookings", AnalyticsController.getBookingAnalytics)
router.get("/revenue", AnalyticsController.getRevenueAnalytics)
router.get("/providers", AnalyticsController.getProviderAnalytics)

export { router as AdminAnalyticsRouter }
