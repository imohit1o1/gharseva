import { z } from "zod"
import mongoose from "mongoose"

export const createCategorySchema = z.object({
    name: z
        .string({ required_error: "Category name is required" })
        .trim()
        .min(4, "Name must be at least 4 characters")
        .max(100, "Name must be less than 100 characters"),
    slug: z.string({ required_error: "Slug is required" }).trim().lowercase(),
    image: z.string({ required_error: "Image is required" }).trim(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    description: z
        .string({ required_error: "Description is required" })
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must be less than 500 characters")
})

export const bulkCreateCategorySchema = z.object({
    categories: z.array(createCategorySchema).min(1, "At least one category is required")
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryIdSchema = z.object({
    id: z
        .string({ required_error: "Category ID is required" })
        .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Category ID format")
})

export const CategoryValidator = {
    createCategorySchema,
    bulkCreateCategorySchema,
    updateCategorySchema,
    categoryIdSchema
}
