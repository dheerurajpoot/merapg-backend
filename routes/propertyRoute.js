import express from "express";
import { addProperty } from "../controllers/propertyController.js";

const router = express.Router();
router.post("/addproperty", addProperty);

export default router;
