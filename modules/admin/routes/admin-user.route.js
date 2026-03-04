import { Router } from "express"
import { validate } from "../../../shared/middlewares/index.middleware.js"
import { AdminController } from "../admin.controller.js"
import { AdminValidator } from "../admin.validator.js"

const router = Router()

router.get("/", validate(AdminValidator.listUsersQuerySchema, "query"), AdminController.getUsers)
router.get("/:userId", validate(AdminValidator.userIdSchema, "params"), AdminController.getUserById)
router.get("/:userId/profile", validate(AdminValidator.userIdSchema, "params"), AdminController.getUserProfile)

export { router as AdminUserRouter }
