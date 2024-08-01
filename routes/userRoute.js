import express from "express";
import {
	getProfile,
	logIn,
	logOut,
	register,
} from "../controllers/userController.js";
import userAuth from "../middleware/auth.js";

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(logIn);
router.route("/logout").get(logOut);
router.route("/profile/:id").get(getProfile);
export default router;
