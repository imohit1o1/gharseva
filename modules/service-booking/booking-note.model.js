import mongoose, { Schema } from "mongoose"

const bookingNoteSchema = new Schema(
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
        note: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, "Note must be less than 1000 characters long"],
        }
    },
    {
        timestamps: true
    }
)

export const BookingNoteModel = mongoose.model("BookingNote", bookingNoteSchema)
