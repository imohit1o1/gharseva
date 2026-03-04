import { UserModel } from "../user/user.model.js"
import { ServiceProviderProfileModel } from "./service-provider-profile.model.js"
import { ServiceCategoryModel } from "../service-category/index.service-category.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { RoleConstants, PagintationConstants } from "../../constants.js"

const completeProfile = async (userId, profileData) => {
    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        if (user.isProfileComplete) {
            throw ApiErrorUtil.conflict("Profile is already complete")
        }

        const { first_name, last_name, category_id, city, area, pincode, base_price } = profileData

        // verify category
        const category = await ServiceCategoryModel.findById(category_id)
        if (!category) {
            throw ApiErrorUtil.notFound("Service category not found")
        }

        const newProfile = await ServiceProviderProfileModel.create({
            user_id: userId,
            category_id,
            city,
            area,
            pincode,
            base_price
        })

        user.isProfileComplete = true
        user.profile_id = newProfile._id
        user.display_name = `${first_name} ${last_name}`
        await user.save()

        const userObj = user.toObject()
        delete userObj.password

        LoggerUtil.info(`Provider profile completed successfully for user ${userId}`, { userId })
        return { user: userObj, profile: newProfile }
    } catch (error) {
        LoggerUtil.error("Error in ProviderService.completeProfile", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error completing provider profile")
    }
}

const getMe = async (userId) => {
    try {
        const user = await UserModel.findById(userId)
            .select("-password")
            .populate("profile_id", "-_id -user_id") // get all except id and user_id relation
            .lean()

        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        LoggerUtil.info(`Provider profile fetched successfully for user ${userId}`, { userId })

        const { profile_id, ...userData } = user
        return {
            ...userData,
            ...(profile_id || {})
        }
    } catch (error) {
        LoggerUtil.error("Error in ProviderService.getMe", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching provider profile")
    }
}

const updateProfile = async (userId, profileData) => {
    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        if (!user.isProfileComplete || !user.profile_id) {
            throw ApiErrorUtil.badRequest("Profile must be completed before updating")
        }

        const { first_name, last_name, category_id, city, area, pincode, base_price } = profileData

        const updateData = {}
        if (city) updateData.city = city
        if (area) updateData.area = area
        if (pincode) updateData.pincode = pincode
        if (base_price !== undefined) updateData.base_price = base_price

        if (category_id) {
            const category = await ServiceCategoryModel.findById(category_id)
            if (!category) {
                throw ApiErrorUtil.notFound("Service category not found")
            }
            updateData.category_id = category_id
        }

        const updatedProfile = await ServiceProviderProfileModel.findByIdAndUpdate(
            user.profile_id,
            { $set: updateData },
            { new: true, runValidators: true }
        )

        if (first_name || last_name) {
            const currentNames = user.display_name.split(" ")
            const currentFirstName = currentNames[0] || ""
            const currentLastName = currentNames.slice(1).join(" ") || ""

            user.display_name = `${first_name || currentFirstName} ${last_name || currentLastName}`
            await user.save()
        }

        LoggerUtil.info(`Provider profile updated successfully for user ${userId}`, { userId })
        return updatedProfile
    } catch (error) {
        LoggerUtil.error("Error in ProviderService.updateProfile", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error updating provider profile")
    }
}

const toggleAvailability = async (userId, is_available) => {
    try {
        const user = await UserModel.findById(userId)
        if (!user || user.role !== RoleConstants.SERVICE_PROVIDER) {
            throw ApiErrorUtil.notFound("Provider not found")
        }

        if (!user.isProfileComplete || !user.profile_id) {
            throw ApiErrorUtil.badRequest("Profile must be completed before modifying availability")
        }

        const profile = await ServiceProviderProfileModel.findByIdAndUpdate(
            user.profile_id,
            { $set: { is_available } },
            { new: true, runValidators: true }
        )

        if (!profile) {
            throw ApiErrorUtil.notFound("Provider profile not found")
        }

        LoggerUtil.info(`Provider availability updated for user ${userId} to ${is_available}`)
        return { is_available: profile.is_available }
    } catch (error) {
        LoggerUtil.error("Error in ProviderService.toggleAvailability", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error updating availability status")
    }
}


const getAllProviders = async (queryFilters = {}) => {
    try {
        const {
            page = PagintationConstants.PAGE,
            limit = PagintationConstants.LIMIT,
            city,
            area,
            category_id,
            is_approved,
            is_available
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const filter = {}
        if (city) filter.city = new RegExp(city, "i")
        if (area) filter.area = new RegExp(area, "i")
        if (category_id) filter.category_id = category_id
        if (is_approved !== undefined) filter.is_approved = is_approved === "true" || is_approved === true
        if (is_available !== undefined) filter.is_available = is_available === "true" || is_available === true

        const profiles = await ServiceProviderProfileModel.find(filter)
            .populate("user_id", "email role display_name isProfileComplete createdAt updatedAt")
            .populate("category_id", "name")
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await ServiceProviderProfileModel.countDocuments(filter)

        const formattedProviders = profiles.map(profile => {
            const { user_id, ...profileData } = profile
            return {
                ...(user_id || {}),
                ...profileData,
            }
        })

        LoggerUtil.info("Providers list fetched successfully", { count: formattedProviders.length })

        return {
            providers: formattedProviders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in ProviderService.getAllProviders", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching providers list")
    }
}


const getProviderById = async (providerId) => {
    try {
        const user = await UserModel.findById(providerId)
            .select("-password")
            .populate("profile_id", "-_id -user_id") // get all except id and user_id relation
            .lean()

        if (!user || user.role !== RoleConstants.SERVICE_PROVIDER) {
            throw ApiErrorUtil.notFound("Provider not found")
        }

        LoggerUtil.info(`Provider profile fetched successfully for user ${providerId}`)

        const { profile_id, ...userData } = user
        return {
            ...userData,
            ...(profile_id || {})
        }
    } catch (error) {
        LoggerUtil.error("Error in ProviderService.getProviderById", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching provider profile")
    }
}




export const ProviderService = {
    completeProfile,
    getMe,
    updateProfile,
    toggleAvailability,
    getAllProviders,
    getProviderById
}
