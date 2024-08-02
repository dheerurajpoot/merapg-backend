import express from "express";
import { logIn, logOut, register } from "../controllers/userController.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", logIn);
router.get("/logout", logOut);
export default router;
