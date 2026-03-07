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
            limit = PagintationConstants.LIMIT,
            isProfileComplete
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const filter = { role: RoleConstants.CUSTOMER }
        if (isProfileComplete !== undefined) {
            filter.isProfileComplete = isProfileComplete
        }

        const users = await UserModel.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "userprofiles",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "profile"
                }
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project: {
                    _id: 1,
                    display_name: 1,
                    email: 1,
                    role: 1,
                    createdAt: 1,
                    profileComplete: "$isProfileComplete",
                    firstName: "$profile.first_name",
                    lastName: "$profile.last_name",
                    city: "$profile.city",
                    area: "$profile.area",
                    pincode: "$profile.pincode"
                }
            }
        ])

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
        const user = await UserModel.findById(userId).select("-password").lean()

        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        const profile = await UserProfileModel.findOne({ user_id: userId }).lean()

        return {
            ...user,
            profileComplete: user.isProfileComplete,
            firstName: profile?.first_name || null,
            lastName: profile?.last_name || null,
            city: profile?.city || null,
            area: profile?.area || null,
            pincode: profile?.pincode || null,
            avatar: profile?.avatar || null
        }
    } catch (error) {
        LoggerUtil.error("Error in AdminService.getUserById", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching user")
    }
}

const updateUser = async (userId, updateData) => {
    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        // Update User Model
        const userFields = ["display_name", "email", "isProfileComplete"]
        userFields.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field]
            }
        })
        await user.save()

        // Update Profile Model
        const profileUpdate = {}
        const profileFieldsMap = {
            firstName: "first_name",
            lastName: "last_name",
            city: "city",
            area: "area",
            pincode: "pincode"
        }

        Object.keys(profileFieldsMap).forEach(key => {
            if (updateData[key] !== undefined) {
                profileUpdate[profileFieldsMap[key]] = updateData[key]
            }
        })

        if (Object.keys(profileUpdate).length > 0) {
            await UserProfileModel.findOneAndUpdate(
                { user_id: userId },
                { $set: profileUpdate },
                { upsert: true, new: true }
            )
        }

        return await getUserById(userId)
    } catch (error) {
        LoggerUtil.error("Error in AdminService.updateUser", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error updating user")
    }
}

const deleteUser = async (userId) => {
    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        await UserModel.findByIdAndDelete(userId)
        await UserProfileModel.findOneAndDelete({ user_id: userId })

        return { message: "User and associated profile deleted successfully" }
    } catch (error) {
        LoggerUtil.error("Error in AdminService.deleteUser", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error deleting user")
    }
}

export const AdminService = {
    getProviders,
    getProviderById,
    approveProvider,
    rejectProvider,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
}

