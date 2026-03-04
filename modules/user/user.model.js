import mongoose,{Schema} from "mongoose"
import { RoleConstants } from "../../constants.js"

const userSchema = new Schema(
    {
        display_name: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "Display name must be at least 2 characters long"],
            maxlength: [100, "Display name must be less than 100 characters long"],
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
            required: true,
            minlength: [8, "Password must be at least 8 characters long"],
            maxlength: [32, "Password must be less than 32 characters long"],
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
        },
        profile_id: {
            type: Schema.Types.ObjectId,
            ref: "UserProfile"
        }
    },
    {
        timestamps: true
    }
)

export const UserModel = mongoose.model("User", userSchema)
