import { z } from "zod"

export const completeProfileSchema = z.object({
    first_name: z
        .string({ required_error: "First name is required" })
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(100, "First name must be less than 100 characters"),

    last_name: z
        .string({ required_error: "Last name is required" })
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .max(100, "Last name must be less than 100 characters"),

    city: z
        .string({ required_error: "City is required" })
        .trim()
        .min(2, "City must be at least 2 characters")
        .max(100, "City must be less than 100 characters"),

    area: z
        .string({ required_error: "Area is required" })
        .trim()
        .min(2, "Area must be at least 2 characters")
        .max(100, "Area must be less than 100 characters"),

    pincode: z
        .string({ required_error: "Pincode is required" })
        .trim()
        .min(4, "Pincode must be at least 4 characters")
        .max(10, "Pincode must be less than 10 characters"),

    avatar: z
        .string()
        .url("Please provide a valid avatar URL")
        .optional()
})

export const updateProfileSchema = completeProfileSchema.partial()

export const UserValidator = {
    completeProfileSchema,
    updateProfileSchema
}
