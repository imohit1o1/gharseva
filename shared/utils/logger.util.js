import winston from "winston"
import { config } from "../../config/config.js"

const { app } = config

const loggerInstance = winston.createLogger({
    level: app.isDev ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""
            return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`
        })
    ),
    transports: [new winston.transports.Console()]
})

export const LoggerUtil = {
    info(message, meta = {}) {
        loggerInstance.info(message, meta)
    },

    error(message, meta = {}) {
        loggerInstance.error(message, meta)
    },

    warn(message, meta = {}) {
        loggerInstance.warn(message, meta)
    },

    debug(message, meta = {}) {
        loggerInstance.debug(message, meta)
    }
}

