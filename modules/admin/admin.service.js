import { UserModel } from "../user/user.model.js"
import { UserProfileModel } from "../user/user-profile.model.js"
import { ServiceProviderProfileModel } from "../service-provider/service-provider-profile.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { PagintationConstants, RoleConstants } from "../../constants.js"

// ===================== SERVICE PROVIDER MANAGEMENT =====================

const getProviders = async (queryFilters = {}) => {
    try {
        const {
            page = PagintationConstants.PAGE,
            limit = PagintationConstants.LIMIT,
            city,
            area,
            is_approved
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const filter = {}
        if (city) filter.city = new RegExp(city, "i")
        if (area) filter.area = new RegExp(area, "i")
        if (is_approved !== undefined) filter.is_approved = is_approved

        const providers = await ServiceProviderProfileModel.find(filter)
            .populate("user_id", "display_name email")
            .populate("category_id", "name slug")
            .populate("approved_by", "display_name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await ServiceProviderProfileModel.countDocuments(filter)

        return {
            providers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in AdminService.getProviders", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching service providers")
    }
}

const getProviderById = async (providerId) => {
    try {
        const provider = await ServiceProviderProfileModel.findById(providerId)
            .populate("user_id", "display_name email")
            .populate("category_id", "name slug")
            .populate("approved_by", "display_name email")
            .lean()

        if (!provider) {
            throw ApiErrorUtil.notFound("Service provider not found")
        }

        return provider
    } catch (error) {
        LoggerUtil.error("Error in AdminService.getProviderById", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching service provider")
    }
}

const approveProvider = async (adminId, providerId) => {
    try {
        const provider = await ServiceProviderProfileModel.findByIdAndUpdate(
            providerId,
            {
                $set: {
                    is_approved: true,
                    approved_by: adminId,
                    approved_at: new Date()
                }
            },
            { new: true, runValidators: true }
        )

        if (!provider) {
            throw ApiErrorUtil.notFound("Service provider not found")
        }

        LoggerUtil.info(`Provider ${providerId} approved by admin ${adminId}`)
        return provider
    } catch (error) {
        LoggerUtil.error("Error in AdminService.approveProvider", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error approving provider")
    }
}

const rejectProvider = async (adminId, providerId) => {
    try {
        const provider = await ServiceProviderProfileModel.findByIdAndUpdate(
            providerId,
            {
                $set: {
                    is_approved: false,
                    approved_by: null,
                    approved_at: null
                }
            },
            { new: true }
        )

        if (!provider) {
            throw ApiErrorUtil.notFound("Service provider not found")
        }

        LoggerUtil.info(`Provider ${providerId} rejected by admin ${adminId}`)
        return provider
    } catch (error) {
        LoggerUtil.error("Error in AdminService.rejectProvider", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error rejecting provider")
    }
}

// ===================== USER MANAGEMENT =====================

const getUsers = async (queryFilters = {}) => {
    try {
        const {
            page = PagintationConstants.PAGE,
            limit = PagintationConstants.LIMIT
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const filter = { role: RoleConstants.CUSTOMER }

        const users = await UserModel.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await UserModel.countDocuments(filter)

        return {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in AdminService.getUsers", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching users")
    }
}

const getUserById = async (userId) => {
    try {
        const user = await UserModel.findOne({ _id: userId, role: RoleConstants.CUSTOMER })
            .select("-password")
            .lean()

        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        return user
    } catch (error) {
        LoggerUtil.error("Error in AdminService.getUserById", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching user")
    }
}

const getUserProfile = async (userId) => {
    try {
        const user = await UserModel.findOne({ _id: userId, role: RoleConstants.CUSTOMER })
            .select("_id profile_id isProfileComplete display_name email")
            .lean()

        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        if (!user.isProfileComplete || !user.profile_id) {
            throw ApiErrorUtil.notFound("User profile not yet completed")
        }

        const profile = await UserProfileModel.findById(user.profile_id).lean()
        if (!profile) {
            throw ApiErrorUtil.notFound("User profile not found")
        }

        return profile
    } catch (error) {
        LoggerUtil.error("Error in AdminService.getUserProfile", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching user profile")
    }
}

export const AdminService = {
    getProviders,
    getProviderById,
    approveProvider,
    rejectProvider,
    getUsers,
    getUserById,
    getUserProfile
}

