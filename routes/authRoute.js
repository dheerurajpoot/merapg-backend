import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
const router = express.Router();

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", { failureRedirect: "/login" }),
	(req, res) => {
		const token = jwt.sign(
			{ id: req.user._id },
			process.env.JWT_SECRET_KEY,
			{
				expiresIn: "3d",
			}
		);
		res.cookie("token", token, {
			httpOnly: true,
			secure: true,
		});
		res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
	}
);

router.get("/me", async (req, res) => {
	try {
		const token = req.cookies.token;
		const user = req.user;
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({
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
		console.error(error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

export default router;
