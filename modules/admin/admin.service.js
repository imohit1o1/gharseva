import { UserModel } from "../user/user.model.js"
import { UserProfileModel } from "../user/user-profile.model.js"
import { ServiceProviderProfileModel } from "../service-provider/service-provider-profile.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { PagintationConstants, RoleConstants } from "../../constants.js"

import { ProviderService } from "../service-provider/provider.service.js"

// ===================== SERVICE PROVIDER MANAGEMENT =====================

// ===================== SERVICE PROVIDER MANAGEMENT =====================

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

const updateProvider = async (providerProfileId, updateData) => {
    try {
        const profile = await ServiceProviderProfileModel.findById(providerProfileId)
        if (!profile) {
            throw ApiErrorUtil.notFound("Service provider profile not found")
        }

        const user = await UserModel.findById(profile.user_id)
        if (!user) {
            throw ApiErrorUtil.notFound("User associated with provider not found")
        }

        // Update User fields if provided
        const { firstName, lastName, display_name, email } = updateData
        if (display_name) user.display_name = display_name
        if (email) user.email = email
        if (firstName || lastName) {
            const currentNames = (user.display_name || "").split(" ")
            const currentFirstName = currentNames[0] || ""
            const currentLastName = currentNames.slice(1).join(" ") || ""
            user.display_name = `${firstName || currentFirstName} ${lastName || currentLastName}`
        }
        await user.save()

        // Update Profile fields
        const profileFields = [
            "category_id",
            "city",
            "area",
            "pincode",
            "base_price",
            "experience",
            "avatar",
            "description",
            "is_available",
            "is_featured",
            "is_approved"
        ]
        profileFields.forEach(field => {
            if (updateData[field] !== undefined) {
                profile[field] = updateData[field]
            }
        })

        await profile.save()

        return await ProviderService.getProviderById(providerProfileId)
    } catch (error) {
        LoggerUtil.error("Error in AdminService.updateProvider", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error updating service provider")
    }
}

const deleteProvider = async (providerProfileId) => {
    try {
        const profile = await ServiceProviderProfileModel.findById(providerProfileId)
        if (!profile) {
            throw ApiErrorUtil.notFound("Service provider profile not found")
        }

        const userId = profile.user_id

        await ServiceProviderProfileModel.findByIdAndDelete(providerProfileId)
        await UserModel.findByIdAndDelete(userId)

        LoggerUtil.info(`Provider ${providerProfileId} and user ${userId} deleted by admin`)
        return { message: "Service provider and associated user account deleted successfully" }
    } catch (error) {
        LoggerUtil.error("Error in AdminService.deleteProvider", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error deleting service provider")
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
        await ServiceProviderProfileModel.findOneAndDelete({ user_id: userId })

        return { message: "User and associated profiles deleted successfully" }
    } catch (error) {
        LoggerUtil.error("Error in AdminService.deleteUser", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error deleting user")
    }
}

export const AdminService = {
    approveProvider,
    rejectProvider,
    updateProvider,
    deleteProvider,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
}

