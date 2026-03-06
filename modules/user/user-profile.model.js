import mongoose, { Schema } from "mongoose"

const userProfileSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        first_name: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "First name must be at least 2 characters long"],
            maxlength: [100, "First name must be less than 100 characters long"],
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "Last name must be at least 2 characters long"],
            maxlength: [100, "Last name must be less than 100 characters long"],
        },
        city: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "City must be at least 2 characters long"],
            maxlength: [100, "City must be less than 100 characters long"],
        },
        area: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "Area must be at least 2 characters long"],
            maxlength: [100, "Area must be less than 100 characters long"],
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            minlength: [4, "Pincode must be at least 4 characters long"],
            maxlength: [10, "Pincode must be less than 10 characters long"],
        },
        avatar: {
            type: String,
            default: null
        },
    },
    {
        timestamps: true
    }
)

export const UserProfileModel = mongoose.model("UserProfile", userProfileSchema)
