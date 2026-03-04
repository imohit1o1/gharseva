import { Router } from "express"
import { validate } from "../../../shared/middlewares/index.middleware.js"
import { CategoryController } from "../../service-category/service-category.controller.js"
import { CategoryValidator } from "../../service-category/service-category.validator.js"

const router = Router()

router.post("/", validate(CategoryValidator.createCategorySchema), CategoryController.createCategory)
router.post("/bulk", validate(CategoryValidator.bulkCreateCategorySchema), CategoryController.bulkCreateCategory)
router.put("/:id", validate(CategoryValidator.categoryIdSchema, "params"), validate(CategoryValidator.updateCategorySchema), CategoryController.updateCategory)
router.delete("/:id", validate(CategoryValidator.categoryIdSchema, "params"), CategoryController.deleteCategory)

export { router as AdminServiceCategoryRouter }
