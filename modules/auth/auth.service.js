import bcrypt from "bcryptjs"
import { UserModel } from "../user/user.model.js"
import { ApiErrorUtil, JwtUtil, LoggerUtil } from "../../shared/utils/index.utils.js"

// register the user
const register = async (data) => {
    try {
        const { display_name, email, password, role } = data
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            throw ApiErrorUtil.conflict("An account with this email already exists")
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await UserModel.create({
            display_name,
            email,
            password: hashedPassword,
            role
        })

        const token = JwtUtil.generateToken({
            userId: user._id,
            role: user.role
        })

        const userObj = user.toObject()
        delete userObj.password

        return { user: userObj, token }
    } catch (error) {
        LoggerUtil.error("Error in AuthService.register", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error registering user")
    }
}

// login the user
const login = async ({ email, password }) => {
    try {
        const user = await UserModel.findOne({ email })
        if (!user) {
            throw ApiErrorUtil.badRequest("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw ApiErrorUtil.badRequest("Invalid email or password")
        }

        const token = JwtUtil.generateToken({
            userId: user._id,
            role: user.role
        })

        const userObj = user.toObject()
        delete userObj.password

        return { user: userObj, token }
    } catch (error) {
        LoggerUtil.error("Error in AuthService.login", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error logging in")
    }
}

// refresh the token 
const refreshToken = async (userId) => {
    try {
        const user = await UserModel.findById(userId).select("-password")
        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        const token = JwtUtil.generateToken({
            userId: user._id,
            role: user.role
        })

        return { token }
    } catch (error) {
        LoggerUtil.error("Error in AuthService.refreshToken", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error refreshing token")
    }
}


export const AuthService = { register, login, refreshToken }
