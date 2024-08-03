import { Property } from "../models/propertyModel.js";
import { imgUpload } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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

		const token = req.cookies.token;
		if (!token) {
			return res
				.status(401)
				.json({ message: "Authentication Failed, Login Again!" });
		}
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

		const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
		if (!thumbnailLocalPath) {
			res.status(401).json({
				message: "Thumbnail is Required!",
				success: false,
			});
		}
		let imagesLocalPath = [];
		if (
			req.files &&
			Array.isArray(req.files.images) &&
			req.files.images.length > 0
		) {
			for (const image of req.files?.images) {
				imagesLocalPath.push(image?.path);
			}
		}

		const thumbnail = await imgUpload(thumbnailLocalPath);

		let imagesUrls = [];
		for (const img of imagesLocalPath) {
			const imgRes = await imgUpload(img);
			imagesUrls.push(imgRes.url);
		}

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
			createdBy: decodedToken.userID,
			thumbnail: thumbnail?.url,
			images: imagesUrls || [],
		});

		const property = await newProperty.save();
		res.status(201).json({
			message: "Property added successfully!",
			property,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server error" });
	}
};
