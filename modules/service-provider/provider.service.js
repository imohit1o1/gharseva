import { UserModel } from "../user/user.model.js"
import { ServiceProviderProfileModel } from "./service-provider-profile.model.js"
import { ServiceCategoryModel } from "../service-category/index.service-category.js"
import { ProviderAnalyticsService } from "./provider-analytics.service.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { RoleConstants, PagintationConstants } from "../../constants.js"
import mongoose from "mongoose"

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
        const user = await UserModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "serviceproviderprofiles",
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
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [{ $ifNull: ["$profile", {}] }, "$$ROOT"]
                    }
                }
            },
            {
                $lookup: {
                    from: "servicecategories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    password: 0,
                    profile: 0,
                    user_id: 0,
                    __v: 0
                }
            }
        ]);

        if (!user || user.length === 0) {
            throw ApiErrorUtil.notFound("User not found")
        }

        LoggerUtil.info(`Provider profile fetched successfully for user ${userId}`, { userId })

        return user[0]
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

        const updatedProfile = await ServiceProviderProfileModel.findOneAndUpdate(
            { user_id: userId },
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

        const profile = await ServiceProviderProfileModel.findOneAndUpdate(
            { user_id: userId },
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
            search,
            category_slug,
            is_approved,
            is_available,
            is_featured
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const filter = {}
        if (search) {
            const searchRegex = new RegExp(search, "i")
            filter.$or = [
                { city: searchRegex },
                { area: searchRegex },
                { pincode: searchRegex }
            ]
        }

        if (category_slug) {
            const category = await ServiceCategoryModel.findOne({ slug: category_slug, isActive: true })
            if (!category) {
                return {
                    providers: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        total_pages: 0
                    }
                }
            }
            filter.category_id = category._id
        }

        // Apply approval filter for public marketplace
        if (is_approved !== undefined) {
            filter.is_approved = is_approved === true || is_approved === "true"
        }

        if (is_available !== undefined) filter.is_available = is_available === "true" || is_available === true
        if (is_featured !== undefined) filter.is_featured = is_featured === "true" || is_featured === true

        const profiles = await ServiceProviderProfileModel.find(filter)
            .populate("user_id", "display_name email isProfileComplete")
            .populate("category_id", "name slug")
            .populate("approved_by", "display_name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await ServiceProviderProfileModel.countDocuments(filter)

        LoggerUtil.info("Providers list fetched successfully", { count: profiles.length })

        return {
            providers: profiles,
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

// Admin method - returns ALL providers including unapproved
const getAllProvidersForAdmin = async (queryFilters = {}) => {
    try {
        const {
            page = PagintationConstants.PAGE,
            limit = PagintationConstants.LIMIT,
            search,
            category_slug,
            is_approved,
            is_available,
            is_featured
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const filter = {}
        if (search) {
            const searchRegex = new RegExp(search, "i")
            filter.$or = [
                { city: searchRegex },
                { area: searchRegex },
                { pincode: searchRegex }
            ]
        }

        if (category_slug) {
            const category = await ServiceCategoryModel.findOne({ slug: category_slug, isActive: true })
            if (!category) {
                return {
                    providers: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        total_pages: 0
                    }
                }
            }
            filter.category_id = category._id
        }

        // Admin can filter by approval status if explicitly provided
        if (is_approved !== undefined) {
            filter.is_approved = is_approved === true || is_approved === "true"
        }

        if (is_available !== undefined) filter.is_available = is_available === "true" || is_available === true
        if (is_featured !== undefined) filter.is_featured = is_featured === "true" || is_featured === true

        const profiles = await ServiceProviderProfileModel.find(filter)
            .populate("user_id", "display_name email isProfileComplete")
            .populate("category_id", "name slug")
            .populate("approved_by", "display_name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await ServiceProviderProfileModel.countDocuments(filter)

        console.log("[Admin] Providers list fetched successfully", { count: profiles.length, filters: queryFilters, data: profiles })

        return {
            providers: profiles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in ProviderService.getAllProvidersForAdmin", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching admin providers list")
    }
}


const getProviderById = async (providerId) => {
    try {
        const provider = await ServiceProviderProfileModel.findById(providerId)
            .populate("user_id", "display_name email isProfileComplete")
            .populate("category_id", "name slug")
            .populate("approved_by", "display_name email")
            .lean()

        if (!provider) {
            throw ApiErrorUtil.notFound("Provider not found")
        }

        const analytics = await ProviderAnalyticsService.getProviderAnalytics(providerId)
        provider.analytics = analytics

        LoggerUtil.info(`Provider profile fetched successfully for provider ID ${providerId}`)

        return provider
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
    getAllProvidersForAdmin,
    getProviderById
}
