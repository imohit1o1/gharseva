import { config } from "./config/index.config.js"
import { connectDB } from "./db/index.db.js"
import { app } from "./app.js"
import { LoggerUtil } from "./shared/utils/index.utils.js"

async function serverStart() {
    const port = config.app.port;

    try {
        await connectDB.connect();

        app.listen(port, () => {
            LoggerUtil.info(`Server running on port ${port}`, {
                env: config.app.env
            })
        })
    } catch (error) {
        LoggerUtil.error("Failed to start server", {
            env: config.app.env,
            error: error.message
        })
        process.exit(1)
    }
}

serverStart()