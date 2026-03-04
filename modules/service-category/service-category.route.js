import { Router } from "express"
import { authenticate, authorizeRoles, validate } from "../../shared/middlewares/index.middleware.js"
import { CategoryController } from "./service-category.controller.js"
import { CategoryValidator } from "./service-category.validator.js"
import { RoleConstants } from "../../constants.js"

const router = Router()

// All category routes require authentication
router.use(authenticate)

// All authenticated roles can view categories
router.get("/", CategoryController.getAllCategories)
router.get("/:id", validate(CategoryValidator.categoryIdSchema, "params"), CategoryController.getCategoryById)

// Only Admins can modify categories
router.use(authorizeRoles(RoleConstants.ADMIN))

router.post("/", validate(CategoryValidator.createCategorySchema), CategoryController.createCategory)
router.post("/bulk", validate(CategoryValidator.bulkCreateCategorySchema), CategoryController.bulkCreateCategory)
router.put("/:id", validate(CategoryValidator.categoryIdSchema, "params"), validate(CategoryValidator.updateCategorySchema), CategoryController.updateCategory)
router.delete("/:id", validate(CategoryValidator.categoryIdSchema, "params"), CategoryController.deleteCategory)

export { router as CategoryRouter }
