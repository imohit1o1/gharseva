import { StatusCodes } from "http-status-codes"
import { CategoryService } from "./service-category.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

export const createCategory = AsyncHandlerUtil(async (req, res) => {
    const data = await CategoryService.createCategory(req.body)
    ApiResponseUtil.send(res, StatusCodes.CREATED, "Category created successfully", data)
})

export const bulkCreateCategory = AsyncHandlerUtil(async (req, res) => {
    const data = await CategoryService.bulkCreateCategory(req.body.categories)
    // Allow Partial creation
    const statusCode = data.errors && data.errors.length > 0 ? StatusCodes.MULTI_STATUS : StatusCodes.CREATED
    ApiResponseUtil.send(res, statusCode, "Bulk category operation completed", data)
})

export const getAllCategories = AsyncHandlerUtil(async (req, res) => {
    const data = await CategoryService.getAllCategories()
    ApiResponseUtil.send(res, StatusCodes.OK, "Categories fetched successfully", data)
})

export const getCategoryById = AsyncHandlerUtil(async (req, res) => {
    const data = await CategoryService.getCategoryById(req.params.id)
    ApiResponseUtil.send(res, StatusCodes.OK, "Category fetched successfully", data)
})

export const getCategoryBySlug = AsyncHandlerUtil(async (req, res) => {
    const data = await CategoryService.getCategoryBySlug(req.params.slug)
    ApiResponseUtil.send(res, StatusCodes.OK, "Category fetched successfully", data)
})

export const updateCategory = AsyncHandlerUtil(async (req, res) => {
    const data = await CategoryService.updateCategory(req.params.id, req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "Category updated successfully", data)
})

export const deleteCategory = AsyncHandlerUtil(async (req, res) => {
    const data = await CategoryService.deleteCategory(req.params.id)
    ApiResponseUtil.send(res, StatusCodes.OK, "Category deleted successfully", data)
})

export const CategoryController = {
    createCategory,
    bulkCreateCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory
}
