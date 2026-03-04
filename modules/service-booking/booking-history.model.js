import mongoose, { Schema } from "mongoose"

const bookingHistorySchema = new Schema(
    {
        booking_id: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true
        },
        from: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, "From must be less than 50 characters long"],
        },
        to: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, "To must be less than 50 characters long"],
        },
        changed_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reason: {
            type: String,
            trim: true,
            maxlength: [500, "Reason must be less than 500 characters long"],
        }
    },
    {
        timestamps: true
    }
)

export const BookingHistoryModel = mongoose.model("BookingHistory", bookingHistorySchema)
