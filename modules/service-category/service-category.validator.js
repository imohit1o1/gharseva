import { z } from "zod"
import mongoose from "mongoose"

export const createCategorySchema = z.object({
    name: z
        .string({ required_error: "Category name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    slug: z.string().trim().lowercase().optional(),
    icon: z.string().trim().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    isVisible: z.boolean().optional()
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
