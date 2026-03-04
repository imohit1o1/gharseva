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
        },
        area: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Area must be less than 100 characters long"],
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            minlength: [4, "Pincode must be at least 4 characters long"],
            maxlength: [10, "Pincode must be less than 10 characters long"],
        },
        base_price: {
            type: Number,
            required: true,
            min: 0
        },
        is_available: {
            type: Boolean,
            default: true
        },
        approved_by: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        approved_at: {
            type: Date
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
