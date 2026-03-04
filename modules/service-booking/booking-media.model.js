import mongoose,{Schema} from "mongoose"

const bookingMediaSchema = new Schema(
    {
        booking_id: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true
        },
        type: {
            type: String,
            required: true,
            enum: ["before", "after"]
        },
        media_url: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

export const BookingMediaModel = mongoose.model("BookingMedia", bookingMediaSchema)
