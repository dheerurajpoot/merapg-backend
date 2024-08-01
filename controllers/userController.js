import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const register = async (req, res) => {
	try {
		const { name, mobile, email, password } = req.body;
		if (!name || !mobile || !email || !password) {
			return res.status(401).json({
				message: "All fields are required !",
				success: false,
			});
		}
		const user = await User.findOne({ email });
		if (user) {
			return res.status(401).json({
				message: "User Already Exists",
				success: false,
			});
		}
		// password hashing
		const hashedPassword = await bcryptjs.hash(password, 12);

		await User.create({
			name,
			mobile,
			email,
			password: hashedPassword,
		});
		return res.status(201).json({
			message: "Account Created Successfully",
			success: true,
		});
	} catch (error) {
		console.log(error);
	}
};

// user login

export const logIn = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(401).json({
				message: "All fields are required !",
				success: false,
			});
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({
				message: "Email or Password is Incorrect",
				success: false,
			});
		}
		const passwordMached = await bcryptjs.compare(password, user.password);
		if (!passwordMached) {
			return res.status(401).json({
				message: "Email or Password is Incorrect",
				success: false,
			});
		}

		//tokens

		const tokenData = {
			userID: user._id,
		};
		const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
			expiresIn: "3d",
		});
		return res
			.status(201)
			.cookie("token", token, { expiresIn: "3d", httpOnly: true })
			.json({
				message: `Welcome back: ${user.name}`,
				user,
				success: true,
			});
	} catch (error) {
		console.log(error);
	}
};

// logout
export const logOut = (req, res) => {
	return res.cookie("token", "", { expiresIn: new Date(Date.now()) }).json({
		message: "You have logged out successfully",
		success: true,
	});
};
// get profile data
export const getProfile = async (req, res) => {
	try {
		const id = req.params.id;
		const user = await User.findOne({ _id: id }).select("-password");
		return res.status(200).json({
			user,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

// Update user profile
export const updateUserProfile = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, mobile, email, profilePic } = req.body;

		// if (!name || !username || !email || !userDescription || !profilePic) {
		// 	return res.status(401).json({
		// 		message: "All fields are required!",
		// 		success: false,
		// 	});
		// }

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			});
		}

		user.name = name;
		user.mobile = mobile;
		user.email = email;
		user.profilePic = profilePic;

		await user.save();

		return res.status(200).json({
			message: "Profile updated successfully",
			success: true,
			user,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal server error",
			success: false,
		});
	}
};
