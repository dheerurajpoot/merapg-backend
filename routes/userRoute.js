import express from "express";
import { logIn, logOut, register } from "../controllers/userController.js";

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(logIn);
router.route("/logout").get(logOut);
export default router;
