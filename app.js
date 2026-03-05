import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import { errorHandler } from "./shared/middlewares/index.middleware.js"
import { AuthRouter } from "./modules/auth/index.auth.js"
import { UserRouter } from "./modules/user/index.user.js"
import { ProviderRouter } from "./modules/service-provider/index.provider.js"
import { CategoryRouter } from "./modules/service-category/index.service-category.js"
import { AdminRouter } from "./modules/admin/index.admin.js"
import { config } from "./config/config.js"
import { CustomerBookingRouter, ProviderBookingRouter } from "./modules/service-booking/index.booking.js"
import { UserReviewRouter, ProviderReviewRouter } from "./modules/review/index.review.js"

import { StatusCodes } from "http-status-codes"

const app = express()

// middleware
app.use(helmet())
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(","),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
})
)
app.use(morgan(config.app.env === "development" ? "dev" : "combined"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// =============== Routes =================
// home route
app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json({
        service: "GharSeva Backend API",
        status: "running",
        version: "v1",
        environment: config.app.env,
        timestamp: new Date().toISOString(),
    })
})


// health check route
app.get("/health", (req, res) => {
    res.status(StatusCodes.OK).json({ status: "ok" })
})


// =============== API Routes =================
app.use("/api/v1/auth", AuthRouter)
app.use("/api/v1/users", UserRouter)
app.use("/api/v1/service-providers", ProviderRouter)
app.use("/api/v1/service-categories", CategoryRouter)
app.use("/api/v1/bookings", CustomerBookingRouter)
app.use("/api/v1/service-provider/bookings", ProviderBookingRouter)
app.use("/api/v1/admin", AdminRouter)
app.use("/api/v1/reviews/user", UserReviewRouter)
app.use("/api/v1/reviews/provider", ProviderReviewRouter)

// Global error handler
app.use(errorHandler)

export { app }