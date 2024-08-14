import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
	cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
	api_key: `${process.env.CLOUDINARY_API_KEY}`,
	api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

export const imgUpload = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		// Upload image to Cloudinary
		const uploadResult = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
		});

		// Check if the file exists before attempting to delete it
		if (fs.existsSync(localFilePath)) {
			fs.unlinkSync(localFilePath);
		}

		return uploadResult;
	} catch (error) {
		// Handle the error if the file doesn't exist or any other error occurs
		if (fs.existsSync(localFilePath)) {
			fs.unlinkSync(localFilePath);
		}
		console.log("error:", error);
		return null;
	}
};
