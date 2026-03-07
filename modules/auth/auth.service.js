import { UserModel } from "../user/user.model.js"
import { ServiceProviderProfileModel } from "../service-provider/service-provider-profile.model.js"
import { ServiceCategoryModel } from "../service-category/service-category.model.js"
import { ApiErrorUtil, JwtUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { RoleConstants } from "../../constants.js"
import bcrypt from "bcryptjs"

// register the user
const register = async (data, role = RoleConstants.CUSTOMER) => {
    try {
        const { email, password } = data
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            throw ApiErrorUtil.conflict("An account with this email already exists")
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await UserModel.create({
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

// register the provider
const registerProvider = async (data) => {
    try {
        const {
            email, password, first_name, last_name, category_id, city, area, pincode, base_price, experience, avatar, description
        } = data

        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            throw ApiErrorUtil.conflict("An account with this email already exists")
        }

        // verify category
        const category = await ServiceCategoryModel.findById(category_id)
        if (!category) {
            throw ApiErrorUtil.notFound("Service category not found")
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await UserModel.create({
            email,
            password: hashedPassword,
            role: RoleConstants.SERVICE_PROVIDER,
            display_name: `${first_name} ${last_name}`,
            isProfileComplete: true
        })

        const providerProfile = await ServiceProviderProfileModel.create({
            user_id: user._id,
            category_id,
            city,
            area,
            pincode,
            base_price,
            experience,
            avatar,
            description
        })

        const token = JwtUtil.generateToken({
            userId: user._id,
            role: user.role
        })

        const userObj = user.toObject()
        delete userObj.password

        return { user: userObj, profile: providerProfile, token }
    } catch (error) {
        LoggerUtil.error("Error in AuthService.registerProvider", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error registering provider")
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


export const AuthService = { register, registerProvider, login, refreshToken }
