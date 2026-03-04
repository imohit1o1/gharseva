import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import { errorHandler } from "./shared/middlewares/index.middleware.js"
import { AuthRouter } from "./modules/auth/index.auth.js"
import { UserRouter } from "./modules/user/index.user.js"
import { config } from "./config/config.js"

import { StatusCodes } from "http-status-codes"

const app = express()

// middleware
app.use(helmet())
app.use(cors())
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


// Global error handler
app.use(errorHandler)

export { app }