import { Router } from "express"
import { validate } from "../../shared/middlewares/index.middleware.js"
import { CategoryController } from "./service-category.controller.js"
import { CategoryValidator } from "./service-category.validator.js"

const router = Router()

// All category routes
router.get("/", CategoryController.getAllCategories)
router.get("/slug/:slug", CategoryController.getCategoryBySlug)
router.get("/:id", validate(CategoryValidator.categoryIdSchema, "params"), CategoryController.getCategoryById)

export { router as CategoryRouter }
