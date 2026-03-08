import { Router } from "express"
import { authenticate, authorizeRoles, validate, requireApproval } from "../../../shared/middlewares/index.middleware.js"
import { ProviderBookingController } from "../booking.controller.js"
import { BookingValidator } from "../booking.validator.js"
import { RoleConstants } from "../../../constants.js"

const router = Router()

router.use(authenticate)
router.use(authorizeRoles(RoleConstants.SERVICE_PROVIDER))
router.use(requireApproval)

router.get("/",
    validate(BookingValidator.listBookingsSchema, "query"),
    ProviderBookingController.getProviderBookings
)
router.get("/:bookingId",
    validate(BookingValidator.bookingIdSchema, "params"),
    ProviderBookingController.getProviderBookingById
)
router.patch("/:bookingId/accept",
    validate(BookingValidator.bookingIdSchema, "params"),
    ProviderBookingController.acceptBooking
)
router.patch("/:bookingId/reject",
    validate(BookingValidator.bookingIdSchema, "params"),
    validate(BookingValidator.cancelBookingSchema),
    ProviderBookingController.rejectBooking
)

router.patch("/:bookingId/in-progress",
    validate(BookingValidator.bookingIdSchema, "params"),
    validate(BookingValidator.startBookingSchema),
    ProviderBookingController.startBooking
)
router.patch("/:bookingId/complete",
    validate(BookingValidator.bookingIdSchema, "params"),
    validate(BookingValidator.completeBookingSchema),
    ProviderBookingController.completeBooking
)
router.patch("/:bookingId/cancel",
    validate(BookingValidator.bookingIdSchema, "params"),
    validate(BookingValidator.cancelBookingSchema),
    ProviderBookingController.cancelByProvider
)

export { router as ProviderBookingRouter }
