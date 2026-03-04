import { BookingModel } from "./booking.model.js"
import { BookingHistoryModel } from "./booking-history.model.js"
import { BookingNoteModel } from "./booking-note.model.js"
import { ServiceProviderProfileModel } from "../service-provider/service-provider-profile.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import { BookingStatusConstants, PagintationConstants } from "../../constants.js"

// ===================== HELPERS =====================

const recordHistory = async (bookingId, from, to, changedBy, reason = "") => {
    await BookingHistoryModel.create({ booking_id: bookingId, from, to, changed_by: changedBy, reason })
}

const assertStatus = (booking, allowedStatuses, errorMessage) => {
    if (!allowedStatuses.includes(booking.status)) {
        throw ApiErrorUtil.badRequest(errorMessage)
    }
}


// ===================== CUSTOMER METHODS =====================

const createBooking = async (userId, data) => {
    try {
        const { service_provider_id, schedule_at, address, note } = data

        const providerProfile = await ServiceProviderProfileModel.findById(service_provider_id)
        if (!providerProfile) {
            throw ApiErrorUtil.notFound("Service provider not found")
        }
        if (!providerProfile.is_approved) {
            throw ApiErrorUtil.badRequest("Service provider is not approved")
        }
        if (!providerProfile.is_available) {
            throw ApiErrorUtil.badRequest("Service provider is not available at this time")
        }

        const booking = await BookingModel.create({
            user_id: userId,
            service_provider_id: providerProfile._id,
            schedule_at,
            address,
            price: providerProfile.base_price,
            status: BookingStatusConstants.PENDING
        })

        await recordHistory(booking._id, null, BookingStatusConstants.PENDING, userId, "Booking created")

        if (note) {
            await BookingNoteModel.create({ booking_id: booking._id, user_id: userId, note })
        }

        LoggerUtil.info(`Booking created by user ${userId}`, { bookingId: booking._id })
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.createBooking", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error creating booking")
    }
}

const getUserBookings = async (userId, queryFilters = {}) => {
    try {
        const {
            page = PagintationConstants.PAGE,
            limit = PagintationConstants.LIMIT,
            status
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const filter = { user_id: userId }
        if (status) filter.status = status

        const bookings = await BookingModel.find(filter)
            .populate("service_provider_id", "city area pincode base_price category_id")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await BookingModel.countDocuments(filter)

        return {
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in BookingService.getUserBookings", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching bookings")
    }
}

const getUserBookingById = async (userId, bookingId) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId })
            .populate("service_provider_id", "city area pincode base_price category_id")
            .lean()

        if (!booking) {
            throw ApiErrorUtil.notFound("Booking not found")
        }

        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.getUserBookingById", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching booking")
    }
}

const cancelBooking = async (userId, bookingId, cancel_reason) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId })
        if (!booking) {
            throw ApiErrorUtil.notFound("Booking not found")
        }

        assertStatus(booking,
            [BookingStatusConstants.PENDING, BookingStatusConstants.CONFIRMED],
            "Booking can only be cancelled if it is pending or confirmed"
        )

        const from = booking.status
        booking.status = BookingStatusConstants.CANCELLED
        booking.cancel_reason = cancel_reason
        await booking.save()

        await recordHistory(bookingId, from, BookingStatusConstants.CANCELLED, userId, cancel_reason)

        LoggerUtil.info(`Booking ${bookingId} cancelled by user ${userId}`)
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.cancelBooking", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error cancelling booking")
    }
}

const rescheduleBooking = async (userId, bookingId, schedule_at) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId })
        if (!booking) {
            throw ApiErrorUtil.notFound("Booking not found")
        }

        assertStatus(booking,
            [BookingStatusConstants.PENDING, BookingStatusConstants.CONFIRMED],
            "Booking can only be rescheduled if it is pending or confirmed"
        )

        const oldDate = booking.schedule_at
        booking.schedule_at = schedule_at
        await booking.save()

        await recordHistory(bookingId, booking.status, booking.status, userId, `Rescheduled from ${oldDate} to ${schedule_at}`)

        LoggerUtil.info(`Booking ${bookingId} rescheduled by user ${userId}`)
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.rescheduleBooking", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error rescheduling booking")
    }
}


// ===================== PROVIDER METHODS =====================

const getProviderBookings = async (providerProfileId, queryFilters = {}) => {
    try {
        const {
            page = PagintationConstants.PAGE,
            limit = PagintationConstants.LIMIT,
            status
        } = queryFilters

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const filter = { service_provider_id: providerProfileId }
        if (status) filter.status = status

        const bookings = await BookingModel.find(filter)
            .populate("user_id", "display_name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()

        const total = await BookingModel.countDocuments(filter)

        return {
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: Math.ceil(total / parseInt(limit))
            }
        }
    } catch (error) {
        LoggerUtil.error("Error in BookingService.getProviderBookings", { error: error.message })
        throw ApiErrorUtil.internalServer("Error fetching provider bookings")
    }
}

const getProviderBookingById = async (providerProfileId, bookingId) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, service_provider_id: providerProfileId })
            .populate("user_id", "display_name email")
            .lean()

        if (!booking) {
            throw ApiErrorUtil.notFound("Booking not found")
        }

        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.getProviderBookingById", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error fetching booking")
    }
}

const acceptBooking = async (providerProfileId, providerId, bookingId) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, service_provider_id: providerProfileId })
        if (!booking) throw ApiErrorUtil.notFound("Booking not found")

        assertStatus(booking, [BookingStatusConstants.REQUESTED], "Only requested bookings can be accepted")

        booking.status = BookingStatusConstants.CONFIRMED
        await booking.save()

        await recordHistory(bookingId, BookingStatusConstants.REQUESTED, BookingStatusConstants.CONFIRMED, providerId)
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.acceptBooking", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error accepting booking")
    }
}

const rejectBooking = async (providerProfileId, providerId, bookingId, cancel_reason) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, service_provider_id: providerProfileId })
        if (!booking) throw ApiErrorUtil.notFound("Booking not found")

        assertStatus(booking, [BookingStatusConstants.REQUESTED], "Only requested bookings can be rejected")

        booking.status = BookingStatusConstants.CANCELLED
        booking.cancel_reason = cancel_reason
        await booking.save()

        await recordHistory(bookingId, BookingStatusConstants.REQUESTED, BookingStatusConstants.CANCELLED, providerId, cancel_reason || "Rejected by provider")
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.rejectBooking", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error rejecting booking")
    }
}

const startBooking = async (providerProfileId, providerId, bookingId) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, service_provider_id: providerProfileId })
        if (!booking) throw ApiErrorUtil.notFound("Booking not found")

        assertStatus(booking, [BookingStatusConstants.CONFIRMED], "Only confirmed bookings can be started")

        booking.status = BookingStatusConstants.IN_PROGRESS
        await booking.save()

        await recordHistory(bookingId, BookingStatusConstants.CONFIRMED, BookingStatusConstants.IN_PROGRESS, providerId)
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.startBooking", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error starting booking")
    }
}

const completeBooking = async (providerProfileId, providerId, bookingId) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, service_provider_id: providerProfileId })
        if (!booking) throw ApiErrorUtil.notFound("Booking not found")

        assertStatus(booking, [BookingStatusConstants.IN_PROGRESS], "Only in-progress bookings can be completed")

        booking.status = BookingStatusConstants.COMPLETED
        await booking.save()

        await recordHistory(bookingId, BookingStatusConstants.IN_PROGRESS, BookingStatusConstants.COMPLETED, providerId)
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.completeBooking", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error completing booking")
    }
}

const cancelByProvider = async (providerProfileId, providerId, bookingId, cancel_reason) => {
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, service_provider_id: providerProfileId })
        if (!booking) throw ApiErrorUtil.notFound("Booking not found")

        assertStatus(booking,
            [BookingStatusConstants.PENDING, BookingStatusConstants.CONFIRMED],
            "Booking can only be cancelled if it is pending or confirmed"
        )

        const from = booking.status
        booking.status = BookingStatusConstants.CANCELLED
        booking.cancel_reason = cancel_reason
        await booking.save()

        await recordHistory(bookingId, from, BookingStatusConstants.CANCELLED, providerId, cancel_reason)
        return booking
    } catch (error) {
        LoggerUtil.error("Error in BookingService.cancelByProvider", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Error cancelling booking")
    }
}


export const BookingService = {
    // Customer
    createBooking,
    getUserBookings,
    getUserBookingById,
    cancelBooking,
    rescheduleBooking,
    // Provider
    getProviderBookings,
    getProviderBookingById,
    acceptBooking,
    rejectBooking,
    startBooking,
    completeBooking,
    cancelByProvider
}
