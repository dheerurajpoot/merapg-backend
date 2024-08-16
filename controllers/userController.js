import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { getUserId } from "../utils/getTokenId.js";
import { imgUpload } from "../utils/cloudinary.js";
import { sendMail } from "../utils/mails.js";

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
			id: user._id,
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
	return res
		.status(201)
		.clearCookie("token", { expires: new Date(1), httpOnly: true })
		.clearCookie("connect.sid", { expires: new Date(1), httpOnly: true })
		.json({
			message: "Log out successfully",
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
		let profileImg;
		if (req.files?.profilePic) {
			const profileLocalPath = req.files?.profilePic[0]?.path;
			profileImg = await imgUpload(profileLocalPath);
		}
		user.name = name;
		user.email = email;
		if (profileImg?.url !== "") {
			user.profilePic = profileImg?.secure_url || "";
		}
		await user.save();

		return res.status(200).json({
			message: "Profile updated successfully",
			success: true,
			user: {
				_id: user?._id,
				name: user?.name,
				email: user?.email,
				profilePic: user?.profilePic,
				token: token,
			},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal server error",
			success: false,
		});
	}
};

// send reset password link
export const resetPasswordLink = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			});
		}
		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET_KEY
		);
		await User.findByIdAndUpdate(user?._id, {
			$set: {
				forgotPasswordToken: token,
				forgotPasswordTokenExpiry: Date.now() + 3600000, // 1 hour
			},
		});
		const resetUrl = `Hi ${user?.name}, please follow this link to resest your account password, this link is valid for 1 hour from now <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Click Here to Reset</a> <br> Or <br> If the link above doesn't work, copy and paste the following URL into your browser: ${process.env.FRONTEND_URL}/forgot-password/${token} <br> <br> This link will expire in 1 hours. If you did not request a password reset, please ignore this email. Your password will remain unchanged. <br> <br> For your security, please do not share this link with anyone. <br> <br> If you have any questions or need further assistance, feel free to contact our support team.`;
		const data = {
			to: email,
			text: "",
			subject: "Forgot Password Link",
			html: resetUrl,
		};
		await sendMail(data);
		return res.status(201).json({
			message: "Reset link sended successfully!",
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

// reset password

export const resetPassword = async (req, res) => {
	try {
		const { password, token } = req.body;

		const user = await User.findOne({
			forgotPasswordToken: token,
			forgotPasswordTokenExpiry: { $gt: Date.now() },
		});
		if (!user) {
			return res.status(500).json({
				message: "Token Expired, Please try again later",
				succes: false,
			});
		}
		const hashedPassword = await bcryptjs.hash(password, 12);
		user.password = hashedPassword;
		user.forgotPasswordToken = undefined;
		user.forgotPasswordTokenExpiry = undefined;
		await user.save();
		return res.status(201).json({
			message: "Password Reset successfully!",
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
