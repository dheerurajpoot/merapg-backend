import express from "express";
import {
	addProperty,
	getProperties,
} from "../controllers/propertyController.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post(
	"/addproperty",
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "images", maxCount: 10 },
	]),
	addProperty
);
router.get("/", getProperties);

export default router;
