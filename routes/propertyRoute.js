import express from "express";
import {
	addProperty,
	deleteProperty,
	getProperties,
	getProperty,
	getUserProperty,
	isBooked,
} from "../controllers/propertyController.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post(
	"/addproperty",
	upload.fields([{ name: "images", maxCount: 10 }]),
	addProperty
);
router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/userprop", getUserProperty);
router.delete("/", deleteProperty);
router.put("/isbooked", isBooked);

export default router;
