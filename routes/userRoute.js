import express from "express";
import {
	getProfile,
	logIn,
	logOut,
	register,
	resetPassword,
	resetPasswordLink,
	updateUserProfile,
} from "../controllers/userController.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", logIn);
router.get("/logout", logOut);
router.get("/profile", getProfile);
router.post("/reset-password-link", resetPasswordLink);
router.post("/reset-password", resetPassword);
router.put(
	"/updateprofile",
	upload.fields([{ name: "profilePic", maxCount: 1 }]),
	updateUserProfile
);
export default router;
