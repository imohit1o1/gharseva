import mongoose from "mongoose"
import { config } from "../config/config.js"
import { LoggerUtil } from "../shared/utils/index.utils.js"

export const connectDB = {
    async connect() {
        try {
            LoggerUtil.info("Attempting to connect to MongoDB...")
            await mongoose.connect(config.database.uri)

            LoggerUtil.info("Connected to MongoDB", {
                env: config.app.env
            })
        } catch (error) {
            LoggerUtil.error("Failed to connect to MongoDB", {
                env: config.app.env,
                error: error.message
            })
            throw error
        }
    }
}

