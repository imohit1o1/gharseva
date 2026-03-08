import { StatusCodes } from "http-status-codes"
import { BookingService } from "./booking.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

// ===================== CUSTOMER CONTROLLERS =====================

export const createBooking = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.createBooking(req.user.userId, req.body)
    ApiResponseUtil.send(res, StatusCodes.CREATED, "Booking created successfully", data)
})

export const getUserBookings = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.getUserBookings(req.user.userId, req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Bookings fetched successfully", data)
})

export const getUserBookingById = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.getUserBookingById(req.user.userId, req.params.bookingId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking fetched successfully", data)
})

export const cancelBooking = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.cancelBooking(req.user.userId, req.params.bookingId, req.body.cancel_reason)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking cancelled successfully", data)
})

export const rescheduleBooking = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.rescheduleBooking(req.user.userId, req.params.bookingId, req.body.schedule_at)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking rescheduled successfully", data)
})

export const CustomerBookingController = {
    createBooking,
    getUserBookings,
    getUserBookingById,
    cancelBooking,
    rescheduleBooking
}

// ===================== PROVIDER CONTROLLERS =====================

export const getProviderBookings = AsyncHandlerUtil(async (req, res) => {
    // profile_id is the ServiceProviderProfile._id stored in user.profile_id
    const data = await BookingService.getProviderBookings(req.user.profileId, req.query)
    ApiResponseUtil.send(res, StatusCodes.OK, "Bookings fetched successfully", data)
})

export const getProviderBookingById = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.getProviderBookingById(req.user.profileId, req.params.bookingId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking fetched successfully", data)
})

export const acceptBooking = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.acceptBooking(req.user.profileId, req.user.userId, req.params.bookingId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking accepted successfully", data)
})

export const rejectBooking = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.rejectBooking(req.user.profileId, req.user.userId, req.params.bookingId, req.body.cancel_reason)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking rejected successfully", data)
})

export const startBooking = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.startBooking(req.user.profileId, req.user.userId, req.params.bookingId, req.body.before_image)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking started successfully", data)
})

export const completeBooking = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.completeBooking(req.user.profileId, req.user.userId, req.params.bookingId, req.body.after_image)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking completed successfully", data)
})

export const cancelByProvider = AsyncHandlerUtil(async (req, res) => {
    const data = await BookingService.cancelByProvider(req.user.profileId, req.user.userId, req.params.bookingId, req.body.cancel_reason)
    ApiResponseUtil.send(res, StatusCodes.OK, "Booking cancelled successfully", data)
})

export const ProviderBookingController = {
    getProviderBookings,
    getProviderBookingById,
    acceptBooking,
    rejectBooking,
    startBooking,
    completeBooking,
    cancelByProvider
}
