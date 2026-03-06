import multer from "multer"
import path from "path"
import { ApiErrorUtil } from "../utils/index.utils.js"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/tmp")
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const allowedMimetypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (allowedMimetypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(ApiErrorUtil.badRequest("Only png, jpeg, jpg, and webp images are allowed"), false)
    }
}

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})
