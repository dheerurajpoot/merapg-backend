import { generateSitemap } from "../generateSitemap.js";
import { Property } from "../models/propertyModel.js";
import { imgUpload } from "../utils/cloudinary.js";
import { getUserId } from "../utils/getTokenId.js";
import { v2 as cloudinary } from "cloudinary";

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
		const userId = await getUserId(token);

		if (!title && !location && !ownerContact) {
			return res.status(301).json({
				message: "All Fields are Required!",
				success: false,
			});
		}

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
			imagesUrls.push(imgRes?.secure_url);
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
			createdBy: userId,
			thumbnail: thumbnail?.secure_url || "",
			images: imagesUrls || [],
		});

		const property = await newProperty.save();
		await generateSitemap();
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

// get properties

export const getProperties = async (req, res) => {
	try {
		const { city, category, budget } = req.query;

		const query = { isBooked: false };
		if (city) {
			query.location = { $regex: city, $options: "i" };
		}
		if (category) {
			query.category = { $regex: category, $options: "i" };
		}
		if (budget) {
			const [minBudget, maxBudget] = budget.split("-").map(Number);
			query.rent = { $gte: minBudget, $lte: maxBudget };
		}
		const properties = await Property.find(query);

		if (!properties.length) {
			return res.status(404).json({
				message: "No properties found!",
				success: false,
			});
		}

		res.status(200).json({
			message: "Properties found!",
			properties,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server error" });
	}
};

// get property by id
export const getProperty = async (req, res) => {
	try {
		const { id } = req.params;
		const property = await Property.findById(id);
		if (!property) {
			return res.status(404).json({
				message: "No properties found",
				success: false,
			});
		}
		res.status(200).json({
			message: "Properties found!",
			property,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server error" });
	}
};

// get property by userId
export const getUserProperty = async (req, res) => {
	try {
		const { userId } = req.body;
		const properties = await Property.find({ createdBy: userId });

		if (!properties || properties.length === 0) {
			return res.status(404).json({
				message: "No properties found",
				success: false,
			});
		}

		res.status(200).json({
			message: "Properties found!",
			properties,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server error" });
	}
};

// delete property
export const deleteProperty = async (req, res) => {
	try {
		const { pId } = req.query;
		const property = await Property.findById(pId);

		if (!property) {
			return res.status(404).json({
				message: "No properties found",
				success: false,
			});
		}

		// Extract public IDs from the URLs
		const thumbnailPublicId = property.thumbnail
			.split("/")
			.slice(-1)[0]
			.split(".")[0];
		const imagesPublicIds = property.images.map(
			(img) => img.split("/").slice(-1)[0].split(".")[0]
		);

		// Delete images from Cloudinary
		await cloudinary.uploader.destroy(thumbnailPublicId);
		for (const imgId of imagesPublicIds) {
			await cloudinary.uploader.destroy(imgId);
		}

		await Property.findByIdAndDelete(pId);

		res.status(200).json({
			message: "Property Deleted!",
			property,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server error" });
	}
};

// property booking status
export const isBooked = async (req, res) => {
	try {
		const { pId } = req.query;

		// Find the property by ID
		const property = await Property.findById(pId);

		// If property not found, return 404
		if (!property) {
			return res.status(404).json({
				message: "No properties found",
				success: false,
			});
		}

		// Toggle the isBooked field
		property.isBooked = !property.isBooked;

		// Save the updated property
		await property.save();

		res.status(200).json({
			message: `Property ${property.isBooked ? "Booked" : "Unbooked"}!`,
			property,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server error" });
	}
};
