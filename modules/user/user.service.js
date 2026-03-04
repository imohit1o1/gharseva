
import { UserModel } from "./user.model.js"
import { UserProfileModel } from "./user-profile.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"

const completeProfile = async (userId, profileData) => {
    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        if (user.isProfileComplete) {
            throw ApiErrorUtil.conflict("Profile is already complete")
        }

        const newProfile = await UserProfileModel.create({
            user_id: userId,
            ...profileData
        })

        user.isProfileComplete = true
        user.profile_id = newProfile._id
        user.display_name = `${newProfile.first_name} ${newProfile.last_name}`
        await user.save()

        const userObj = user.toObject()
        delete userObj.password

        LoggerUtil.info(`Profile completed successfully for user ${userId}`, { userId })
        return { user: userObj, profile: newProfile }
    } catch (error) {
        LoggerUtil.error("Error in UserService.completeProfile", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error completing profile")
    }
}

const getMe = async (userId) => {
    try {
        const user = await UserModel.findById(userId)
            .select("-password")
            .populate("profile_id")
            .lean()

        if (!user) {
            throw ApiErrorUtil.notFound("User not found")
        }

        LoggerUtil.info(`Profile fetched successfully for user ${userId}`, { userId })
        return user
    } catch (error) {
        LoggerUtil.error("Error in UserService.getMe", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching user profile")
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

        const updatedProfile = await UserProfileModel.findByIdAndUpdate(
            user.profile_id,
            { $set: profileData },
            { new: true, runValidators: true }
        )

        if (profileData.first_name || profileData.last_name) {
            user.display_name = `${updatedProfile.first_name} ${updatedProfile.last_name}`
            await user.save()
        }

        LoggerUtil.info(`Profile updated successfully for user ${userId}`, { userId })
        return updatedProfile
    } catch (error) {
        LoggerUtil.error("Error in UserService.updateProfile", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error updating profile")
    }
}

export const UserService = {
    completeProfile,
    getMe,
    updateProfile
}
