import { z } from "zod"
import { RoleConstants } from "../../constants.js"

/**
 * Register schema
 */
export const registerSchema = z.object({
    display_name: z
        .string({ required_error: "Display name is required" })
        .trim()
        .min(2, "Display name must be at least 2 characters")
        .max(100, "Display name must be less than 100 characters"),

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

    role: z
        .enum(Object.values(RoleConstants), {
            required_error: "Role is required",
            message: `Role must be one of: ${Object.values(RoleConstants).join(", ")}`
        })
        .default(RoleConstants.CUSTOMER)
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
    registerSchema,
    loginSchema
}
