import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			required: true,
		},
		review: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
