const {
    NODE_ENV,
    PORT,
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = process.env

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
    },
    cloudinary: {
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    }
});