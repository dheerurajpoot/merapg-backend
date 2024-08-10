import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imgUpload = async (localFilePath) => {
	try {
		if (!localFilePath) return null;
		console.log("local path: ", localFilePath);
		const uploadResult = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
		});
		console.log("upload result:", uploadResult);
		fs.unlinkSync(localFilePath);
		return uploadResult;
	} catch (error) {
		fs.unlinkSync(localFilePath);
		console.log(error);
		return null;
	}
};
