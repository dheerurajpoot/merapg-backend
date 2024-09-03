import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imgUpload = async (localFilePath, retries = 3) => {
	try {
		if (!localFilePath) return null;

		// Compress and upload the image
		const uploadResult = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
			transformation: [{ quality: "auto:eco" }, { fetch_format: "auto" }],
		});

		await fs.promises.unlink(localFilePath);
		return uploadResult;
	} catch (error) {
		if (
			(error.code === "ECONNRESET" || error.code === "EPIPE") &&
			retries > 0
		) {
			return imgUpload(localFilePath, retries - 1);
		}

		// Clean up and log the error
		await fs.promises.unlink(localFilePath);
		console.error("Cloudinary Error:", error);
		return null;
	}
};
