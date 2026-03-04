import mongoose, { Schema } from "mongoose"

const serviceCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            maxlength: 100
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        icon: {
            type: String
        },

        sortOrder: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isVisible: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

serviceCategorySchema.index({ isActive: 1, isVisible: 1 })

export const ServiceCategoryModel = mongoose.model("ServiceCategory", serviceCategorySchema)