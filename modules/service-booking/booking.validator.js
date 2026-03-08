import { z } from "zod"
import mongoose from "mongoose"
import { BookingStatusConstants } from "../../constants.js"

const objectIdSchema = (label) =>
    z.string({ required_error: `${label} is required` })
        .refine((val) => mongoose.Types.ObjectId.isValid(val), `Invalid ${label} format`)

export const createBookingSchema = z.object({
    service_provider_id: objectIdSchema("Service provider ID"),

    schedule_at: z
        .string({ required_error: "Schedule date is required" })
        .datetime({ message: "schedule_at must be a valid ISO date string" })
        .refine((val) => new Date(val) > new Date(), "Schedule date must be in the future"),

    address: z.object({
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
            .max(10, "Pincode must be less than 10 characters")
    }, { required_error: "Address is required" }),

    note: z.string().trim().max(1000, "Note must be less than 1000 characters").optional()
})

export const cancelBookingSchema = z.object({
    cancel_reason: z
        .string({ required_error: "Cancel reason is required" })
        .trim()
        .min(5, "Cancel reason must be at least 5 characters")
        .max(500, "Cancel reason must be less than 500 characters")
})

export const rescheduleBookingSchema = z.object({
    schedule_at: z
        .string({ required_error: "Schedule date is required" })
        .datetime({ message: "schedule_at must be a valid ISO date string" })
        .refine((val) => new Date(val) > new Date(), "Schedule date must be in the future")
})

export const bookingIdSchema = z.object({
    bookingId: objectIdSchema("Booking ID")
})

export const startBookingSchema = z.object({
    before_image: z
        .string({ required_error: "Before image is required" })
        .url({ message: "Invalid before image URL" })
})

export const completeBookingSchema = z.object({
    after_image: z
        .string({ required_error: "After image is required" })
        .url({ message: "Invalid after image URL" })
})

export const listBookingsSchema = z.object({
    page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)),
    status: z.enum(Object.values(BookingStatusConstants)).optional()
})

export const BookingValidator = {
    createBookingSchema,
    cancelBookingSchema,
    rescheduleBookingSchema,
    bookingIdSchema,
    startBookingSchema,
    completeBookingSchema,
    listBookingsSchema
}
