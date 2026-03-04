const { NODE_ENV, PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN } = process.env

if (!MONGO_URI) throw new Error("MONGO_URI is required")

export const config = Object.freeze({
    app: {
        env: NODE_ENV || "development",
        port: Number(PORT) || 8000
    },
    database: {
        uri: MONGO_URI
    },
    auth: {
        jwtSecret: JWT_SECRET,
        jwtExpiresIn: JWT_EXPIRES_IN || "1d"
    }
})