import { v2 as cloudinary } from "cloudinary";
import { envVariables } from "./env";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

cloudinary.config({
    cloud_name: envVariables.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVariables.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVariables.CLOUDINARY.CLOUDINARY_API_SECRET
})

export const cloudinaryUpload = cloudinary;

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        const fileWithExtension = url.split("/").pop() || "";  // gets the last part
        const public_id = fileWithExtension.split(".")[0];
        if (public_id) {
            await cloudinary.uploader.destroy(public_id)
        }
    } catch(error){
        console.error("Cloudinary deletion error:", error); // ✅ Better debugging
        throw new AppError("Cloudinary deletion error", httpStatus.BAD_REQUEST);
    }
}