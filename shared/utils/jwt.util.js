import jwt from "jsonwebtoken"
import { config } from "../../config/config.js"

const { jwtSecret, jwtExpiresIn } = config.auth

const generateToken = (payload, expiresIn = jwtExpiresIn) => {
    return jwt.sign(payload, jwtSecret, { expiresIn })
}

const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret)
}

export const JwtUtil = { generateToken, verifyToken }
