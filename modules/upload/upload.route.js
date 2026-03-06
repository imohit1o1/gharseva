import { Router } from "express"
import { StatusCodes } from "http-status-codes"
import { authenticate, upload } from "../../shared/middlewares/index.middleware.js"
import { CloudinaryUtil, ApiResponseUtil, ApiErrorUtil, AsyncHandlerUtil, LoggerUtil } from "../../shared/utils/index.utils.js"
import fs from "fs/promises"

const uploadImage = AsyncHandlerUtil(async (req, res) => {
    if (!req.file) {
        throw ApiErrorUtil.badRequest("No image provided")
    }

    try {
        const result = await CloudinaryUtil.uploadToCloudinary(req.file.path, req.body.folder || "gharseva")

        // Delete local temp file
        await fs.unlink(req.file.path).catch(err => LoggerUtil.error("Failed to delete local temp file", { error: err.message }))

        ApiResponseUtil.send(res, StatusCodes.OK, "Image uploaded successfully", {
            url: result.secure_url,
            public_id: result.public_id
        })
    } catch (error) {
        // Ensure local file is deleted even if upload fails
        if (req.file && req.file.path) {
            await fs.unlink(req.file.path).catch(() => { })
        }
        throw error
    }
})

const router = Router()

router.post("/image", authenticate, upload.single("image"), uploadImage)

export { router as UploadRouter }
