import { Property } from "../models/propertyModel.js";
import cloudinary from "cloudinary";
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const addProperty = async (req, res) => {
	try {
		const {
			title,
			description,
			availability,
			category,
			rent,
			area,
			location,
			services,
			ownerName,
			ownerContact,
		} = req.body;

		let thumbnailUrl = "";
		// if (req.files.thumbnail) {
		// 	const thumbnailResult = await cloudinary.uploader.upload(
		// 		req.files.thumbnail[0].path
		// 	);
		// 	thumbnailUrl = thumbnailResult.secure_url;
		// }

		const imagesUrls = [];
		// if (req.files.images) {
		// 	for (const image of req.files.images) {
		// 		const result = await cloudinary.uploader.upload(image.path);
		// 		imagesUrls.push(result.secure_url);
		// 	}
		// }

		const newProperty = new Property({
			title,
			description,
			availability,
			category,
			rent,
			area,
			location,
			services,
			ownerName,
			ownerContact,
			thumbnail: thumbnailUrl,
			images: imagesUrls,
		});

		await newProperty.save();
		console.log(newProperty);
		res.status(201).json({ message: "Property added successfully!" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
