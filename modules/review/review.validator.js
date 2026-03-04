import { z } from "zod"
import mongoose from "mongoose"

const objectIdSchema = (label) =>
    z.string({ required_error: `${label} is required` })
        .refine((val) => mongoose.Types.ObjectId.isValid(val), `Invalid ${label} format`)

export const createReviewSchema = z.object({
    rating: z
        .number({ required_error: "Rating is required" })
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
    review: z
        .string()
        .trim()
        .max(1000, "Review must be less than 1000 characters")
        .optional()
})

export const reviewIdSchema = z.object({
    reviewId: objectIdSchema("Review ID")
})

export const bookingIdParamSchema = z.object({
    bookingId: objectIdSchema("Booking ID")
})

export const listReviewsQuerySchema = z.object({
    page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val) : 10))
})

export const ReviewValidator = {
    createReviewSchema,
    reviewIdSchema,
    bookingIdParamSchema,
    listReviewsQuerySchema
}
