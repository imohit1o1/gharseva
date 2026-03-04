import mongoose, { Schema } from "mongoose"
import { ReviewStatusConstants } from "../../constants.js"

const reviewSchema = new Schema(
    {
        booking_id: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        service_provider_id: {
            type: Schema.Types.ObjectId,
            ref: "ServiceProviderProfile",
            required: true,
            index: true
        },
        review: {
            type: String,
            trim: true,
            maxlength: [1000, "Review must be less than 1000 characters long"],
        },
        rating: {
            type: Number,
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating must be at most 5"],
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(ReviewStatusConstants),
            default: ReviewStatusConstants.VISIBLE
        },
        moderated_by: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const ReviewModel = mongoose.model("Review", reviewSchema)
