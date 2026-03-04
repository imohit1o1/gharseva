import { ServiceCategoryModel } from "./service-category.model.js"
import { ApiErrorUtil, LoggerUtil } from "../../shared/utils/index.utils.js"

const createCategory = async (data) => {
    try {
        const { name, icon, sortOrder, isActive, isVisible } = data
        let { slug } = data

        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }

        const existingCategory = await ServiceCategoryModel.findOne({
            $or: [
                { name: new RegExp(`^${name}$`, 'i') },
                { slug: slug }
            ]
        })
        if (existingCategory) {
            throw ApiErrorUtil.conflict("Category with this name or slug already exists")
        }

        const payload = { name, slug }
        if (icon !== undefined) payload.icon = icon
        if (sortOrder !== undefined) payload.sortOrder = sortOrder
        if (isActive !== undefined) payload.isActive = isActive
        if (isVisible !== undefined) payload.isVisible = isVisible

        const category = await ServiceCategoryModel.create(payload)
        return category
    } catch (error) {
        LoggerUtil.error("Error creating category", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Failed to create category")
    }
}

const bulkCreateCategory = async (categoriesData) => {
    try {
        const payloads = categoriesData.map(data => {
            const { name, icon, sortOrder, isActive, isVisible } = data
            let { slug } = data

            if (!slug) {
                slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            }

            const payloadItem = { name, slug }
            if (icon !== undefined) payloadItem.icon = icon
            if (sortOrder !== undefined) payloadItem.sortOrder = sortOrder
            if (isActive !== undefined) payloadItem.isActive = isActive
            if (isVisible !== undefined) payloadItem.isVisible = isVisible

            return payloadItem
        })

        // ordered: false allows inserting remaining documents even if some fail (e.g. duplicate key)
        const result = await ServiceCategoryModel.insertMany(payloads, { ordered: false })

        return {
            insertedCount: result.length,
            categories: result
        }
    } catch (error) {
        // If it's a Mongoose insertMany error, it throws an error containing `insertedDocs` and `writeErrors` when ordered: false
        if (error.name === 'BulkWriteError') {
            LoggerUtil.warn("Partial failure during bulk category creation", {
                inserted: error.insertedDocs?.length || 0,
                failed: error.writeErrors?.length || 0
            })
            return {
                insertedCount: error.insertedDocs?.length || 0,
                categories: error.insertedDocs || [],
                errors: error.writeErrors.map(e => ({
                    index: e.index,
                    message: e.errmsg
                }))
            }
        }

        LoggerUtil.error("Error bulk creating categories", { error: error.message })
        throw ApiErrorUtil.internalServer("Failed to bulk create categories")
    }
}

const getAllCategories = async () => {
    try {
        const categories = await ServiceCategoryModel.find().lean()
        return categories
    } catch (error) {
        LoggerUtil.error("Error fetching categories", { error: error.message })
        throw ApiErrorUtil.internalServer("Failed to fetch categories")
    }
}

const getCategoryById = async (categoryId) => {
    try {
        const category = await ServiceCategoryModel.findById(categoryId).lean()
        if (!category) {
            throw ApiErrorUtil.notFound("Category not found")
        }
        return category
    } catch (error) {
        LoggerUtil.error("Error fetching category", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Failed to fetch category")
    }
}

const updateCategory = async (categoryId, data) => {
    try {
        const { name, slug, icon, sortOrder, isActive, isVisible } = data

        const category = await ServiceCategoryModel.findById(categoryId)
        if (!category) {
            throw ApiErrorUtil.notFound("Category not found")
        }

        if (name || slug) {
            const searchOr = []
            if (name) searchOr.push({ name: new RegExp(`^${name}$`, 'i') })
            if (slug) searchOr.push({ slug: slug })

            if (searchOr.length > 0) {
                const existingCategory = await ServiceCategoryModel.findOne({
                    $or: searchOr,
                    _id: { $ne: categoryId }
                })
                if (existingCategory) {
                    throw ApiErrorUtil.conflict("Category with this name or slug already exists")
                }
            }
            if (name) category.name = name
            if (slug) category.slug = slug
        }

        if (icon !== undefined) category.icon = icon
        if (sortOrder !== undefined) category.sortOrder = sortOrder
        if (isActive !== undefined) category.isActive = isActive
        if (isVisible !== undefined) category.isVisible = isVisible

        await category.save()

        return category
    } catch (error) {
        LoggerUtil.error("Error updating category", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Failed to update category")
    }
}

const deleteCategory = async (categoryId) => {
    try {
        const category = await ServiceCategoryModel.findByIdAndDelete(categoryId)
        if (!category) {
            throw ApiErrorUtil.notFound("Category not found")
        }
        return { deleted: true }
    } catch (error) {
        LoggerUtil.error("Error deleting category", { error: error.message })
        if (error.statusCode) throw error
        throw ApiErrorUtil.internalServer("Failed to delete category")
    }
}

export const CategoryService = {
    createCategory,
    bulkCreateCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
}
