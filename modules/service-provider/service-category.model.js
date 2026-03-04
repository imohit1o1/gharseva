import mongoose,{Schema} from "mongoose"

const serviceCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            maxlength: [100, "Name must be less than 100 characters long"],
        }
    },
    {
        timestamps: true
    }
)

export const ServiceCategoryModel = mongoose.model("ServiceCategory", serviceCategorySchema)
