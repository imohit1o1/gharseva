import { Router } from "express"
import { validate } from "../../shared/middlewares/index.middleware.js"
import { CategoryController } from "./service-category.controller.js"
import { CategoryValidator } from "./service-category.validator.js"

const router = Router()

console.log("[service-category.route.js] Router initialized")

// All category routes
router.get("/", 
    (req, res, next) => {
        console.log("[service-category.route.js] ✅ HIT / route")
        next()
    },
    CategoryController.getAllCategories
)
router.get("/slug/:slug", CategoryController.getCategoryBySlug)
router.get("/:id", validate(CategoryValidator.categoryIdSchema, "params"), CategoryController.getCategoryById)

export { router as CategoryRouter }
