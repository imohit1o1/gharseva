import { z } from "zod"
import { RoleConstants } from "../../constants.js"
import mongoose from "mongoose"

/**
 * Customer Register schema
 */
export const customerRegisterSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(254, "Email must be less than 254 characters"),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
        ),
})


/**
 * Provider Register schema
 */
export const providerRegisterSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(254, "Email must be less than 254 characters"),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
        ),

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

    category_id: z
        .string({ required_error: "Category ID is required" })
        .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Category ID"),

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

    base_price: z
        .number({ required_error: "Base price is required" })
        .min(0, "Base price cannot be negative"),

    experience: z
        .number({ required_error: "Experience is required" })
        .min(0, "Experience cannot be negative"),

    avatar: z
        .string({ required_error: "Avatar is required" })
        .url("Please provide a valid avatar URL"),

    description: z
        .string({ required_error: "Description is required" })
        .trim()
        .min(20, "Description must be at least 20 characters")
        .max(500, "Description must be less than 500 characters")
})

/**
 * Login schema
 */
export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address"),

    password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required")
})

export const AuthValidator = {
    customerRegisterSchema,
    providerRegisterSchema,
    loginSchema
}
