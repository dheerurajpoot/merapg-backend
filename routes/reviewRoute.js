import express from "express";
import { addReviews, getReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", addReviews);
router.get("/", getReviews);

export default router;
