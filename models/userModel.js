import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		profilePic: {
			type: String,
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
		forgotPasswordToken: {
			type: String,
		},
		forgotPasswordTokenExpiry: {
			type: Date,
			default: Date.now(),
		},
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);
