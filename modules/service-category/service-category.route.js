import { Router } from "express"
import { authenticate, validate } from "../../shared/middlewares/index.middleware.js"
import { CategoryController } from "./service-category.controller.js"
import { CategoryValidator } from "./service-category.validator.js"

const router = Router()

// All category routes require authentication
router.use(authenticate)

// All authenticated roles can view categories
router.get("/", CategoryController.getAllCategories)
router.get("/slug/:slug", CategoryController.getCategoryBySlug)
router.get("/:id", validate(CategoryValidator.categoryIdSchema, "params"), CategoryController.getCategoryById)

export { router as CategoryRouter }
