import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		availability: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		rent: {
			type: Number,
			required: true,
		},
		area: {
			type: Number,
		},
		location: {
			type: String,
			required: true,
		},
		services: {
			type: String,
		},
		ownerName: {
			type: String,
			required: true,
		},
		ownerContact: {
			type: Number,
			required: true,
		},
		thumbnail: {
			type: String,
		},
		images: {
			type: [String],
		},
	},
	{ timestamps: true }
);

export const Property = mongoose.model("Property", propertySchema);
