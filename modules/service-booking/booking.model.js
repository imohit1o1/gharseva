import mongoose, { Schema } from "mongoose"
import { BookingStatusConstants } from "../../constants.js"

const bookingAddressSchema = new Schema(
    {
        city: {
            type: String,
            trim: true,
            maxlength: [100, "City must be less than 100 characters long"],
        },
        area: {
            type: String,
            trim: true,
            maxlength: [100, "Area must be less than 100 characters long"],
        },
        pincode: {
            type: String,
            trim: true,
            minlength: [4, "Pincode must be at least 4 characters long"],
            maxlength: [10, "Pincode must be less than 10 characters long"],
        }
    },
    { _id: false }
)

const bookingSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        user_profile_id: {
            type: Schema.Types.ObjectId,
            ref: "UserProfile",
            required: true
        },
        service_provider_id: {
            type: Schema.Types.ObjectId,
            ref: "ServiceProviderProfile",
            required: true,
            index: true
        },
        address: {
            type: bookingAddressSchema
        },
        schedule_at: {
            type: Date,
            required: true
        },
        image_url: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(BookingStatusConstants),
            default: BookingStatusConstants.PENDING,
            index: true
        },
        cancel_reason: {
            type: String,
            trim: true,
            maxlength: [500, "Cancel reason must be less than 500 characters long"],
        }
    },
    {
        timestamps: true
    }
)

export const BookingModel = mongoose.model("Booking", bookingSchema)
