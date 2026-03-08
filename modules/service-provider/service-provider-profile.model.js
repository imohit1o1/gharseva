import mongoose, { Schema } from "mongoose"

const serviceProviderProfileSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: "ServiceCategory",
            required: true,
            index: true
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "City must be less than 100 characters long"],
            index: true
        },
        area: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Area must be less than 100 characters long"],
            index: true
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            minlength: [4, "Pincode must be at least 4 characters long"],
            maxlength: [10, "Pincode must be less than 10 characters long"],
            index: true
        },
        base_price: {
            type: Number,
            required: true,
            min: 0
        },
        experience: {
            type: Number,
            required: [true, "Experience is required"],
            min: [0, "Experience cannot be negative"],
        },
        avatar: {
            type: String,
            required: [true, "Avatar is required"]
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: [500, "Description must be less than 500 characters long"]
        },
        is_available: {
            type: Boolean,
            default: true
        },
        is_featured: {
            type: Boolean,
            default: false
        },
        is_approved: {
            type: Boolean,
            default: false
        },
        approved_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            default: null
        },
        approved_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

export const ServiceProviderProfileModel = mongoose.model(
    "ServiceProviderProfile",
    serviceProviderProfileSchema
)
