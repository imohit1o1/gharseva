import { v2 as cloudinary } from "cloudinary"
import { config } from "../../config/config.js"
import { LoggerUtil } from "./logger.util.js"

// Configure Cloudinary
cloudinary.config(config.cloudinary)

/**
 * Upload a file to Cloudinary
 * @param {string} filePath Local path to the file
 * @param {string} folder Cloudinary folder name
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = "gharseva") => {
    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
        folder,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };

    try {
        const result = await cloudinary.uploader.upload(filePath, options)
        return result
    } catch (error) {
        LoggerUtil.error("Cloudinary upload failed", { error: error.message })
        throw error
    }
}

export const CloudinaryUtil = {
    uploadToCloudinary
}
