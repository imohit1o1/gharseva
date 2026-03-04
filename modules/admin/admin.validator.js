import { z } from "zod"
import mongoose from "mongoose"

const objectIdSchema = (label) =>
    z.string({ required_error: `${label} is required` })
        .refine((val) => mongoose.Types.ObjectId.isValid(val), `Invalid ${label} format`)

export const providerIdSchema = z.object({
    providerId: objectIdSchema("Provider ID")
})

export const userIdSchema = z.object({
    userId: objectIdSchema("User ID")
})

export const listProvidersQuerySchema = z.object({
    page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)),
    is_approved: z.enum(["true", "false"]).optional().transform(val =>
        val === undefined ? undefined : val === "true"
    )
})

export const listUsersQuerySchema = z.object({
    page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val) : 10))
})

export const AdminValidator = {
    providerIdSchema,
    userIdSchema,
    listProvidersQuerySchema,
    listUsersQuerySchema
}
