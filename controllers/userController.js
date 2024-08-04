import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { getUserId } from "../utils/getTokenId.js";
import { imgUpload } from "../utils/cloudinary.js";

export const register = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
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
			email,
			password: hashedPassword,
		});
		return res.status(201).json({
			message: "Account Created Successfully",
			success: true,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal server error, Try again later!",
			success: false,
		});
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
			.cookie("token", token, {
				expiresIn: "3d",
				httpOnly: true,
			})
			.json({
				message: `Welcome: ${user.name}!`,
				user: {
					_id: user?._id,
					name: user?.name,
					email: user?.email,
					profilePic: user?.profilePic,
					token: token,
				},
				success: true,
			});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal server error, Try again later!",
			success: false,
		});
	}
};

// logout
export const logOut = (req, res) => {
	return res.cookie("token", "", { expiresIn: new Date(Date.now()) }).json({
		message: "You have logged out successfully",
		success: true,
	});
};

// get user profile
export const getProfile = async (req, res) => {
	try {
		const token = req.cookies.token;
		const userId = await getUserId(token);
		const user = await User.findById(userId).select("-password");
		if (!user) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			});
		}
		return res.status(200).json({
			message: "Profile found ",
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

// Update user profile
export const updateUserProfile = async (req, res) => {
	try {
		const token = req.cookies.token;
		const userId = await getUserId(token);
		const { name, email } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			});
		}

		const profileLocalPath = req.files?.profilePic[0]?.path;
		const profileImg = await imgUpload(profileLocalPath);

		user.name = name;
		user.email = email;
		user.profilePic = profileImg?.url || "";

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
