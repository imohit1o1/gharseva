import mongoose, { Schema } from "mongoose"
import { RoleConstants } from "../../constants.js"

const userSchema = new Schema(
    {
        display_name: {
            type: String,
            trim: true,
            default: ""
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: [254, "Email must be less than 254 characters long"],
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(RoleConstants),
            default: RoleConstants.CUSTOMER
        },
        isProfileComplete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

export const UserModel = mongoose.model("User", userSchema)
