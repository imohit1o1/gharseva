import { Router } from "express"
import { authenticate, authorizeRoles, validate } from "../../../shared/middlewares/index.middleware.js"
import { CustomerBookingController } from "../booking.controller.js"
import { BookingValidator } from "../booking.validator.js"
import { RoleConstants } from "../../../constants.js"

const router = Router()

router.use(authenticate)
router.use(authorizeRoles(RoleConstants.CUSTOMER))

router.get("/",
    validate(BookingValidator.listBookingsSchema, "query"),
    CustomerBookingController.getUserBookings
)
router.post("/",
    validate(BookingValidator.createBookingSchema),
    CustomerBookingController.createBooking
)
router.get("/:bookingId",
    validate(BookingValidator.bookingIdSchema, "params"),
    CustomerBookingController.getUserBookingById
)
router.post("/:bookingId/cancel",
    validate(BookingValidator.bookingIdSchema, "params"),
    validate(BookingValidator.cancelBookingSchema),
    CustomerBookingController.cancelBooking
)
router.post("/:bookingId/reschedule",
    validate(BookingValidator.bookingIdSchema, "params"),
    validate(BookingValidator.rescheduleBookingSchema),
    CustomerBookingController.rescheduleBooking
)

export { router as CustomerBookingRouter }
