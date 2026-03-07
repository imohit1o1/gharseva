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

        image: {
            type: String,
            required: true
        },

        sortOrder: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
)

serviceCategorySchema.index({ isActive: 1, isFeatured: 1 })

export const ServiceCategoryModel = mongoose.model("ServiceCategory", serviceCategorySchema)