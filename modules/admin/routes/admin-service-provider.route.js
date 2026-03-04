import { Router } from "express"
import { validate } from "../../../shared/middlewares/index.middleware.js"
import { AdminController } from "../admin.controller.js"
import { AdminValidator } from "../admin.validator.js"

const router = Router()

router.get("/", validate(AdminValidator.listProvidersQuerySchema, "query"), AdminController.getProviders)
router.get("/:providerId", validate(AdminValidator.providerIdSchema, "params"), AdminController.getProviderById)
router.put("/:providerId/approve", validate(AdminValidator.providerIdSchema, "params"), AdminController.approveProvider)
router.put("/:providerId/reject", validate(AdminValidator.providerIdSchema, "params"), AdminController.rejectProvider)

export { router as AdminServiceProviderRouter }
