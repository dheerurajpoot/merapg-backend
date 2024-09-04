import { Review } from "../models/reviewModel.js";

export const addReviews = async (req, res) => {
	try {
		const { name, email, rating, review } = req.body;

		// Data validation
		if (!name || !email || !review || !rating) {
			return res.status(400).json({
				message: "All Fields are required!",
				success: false,
			});
		}

		// Create a new review
		const newReview = new Review({
			name,
			email,
			rating,
			review,
		});

		const savedReview = await newReview.save();

		res.status(201).json({
			message: "Review added successfully!",
			savedReview,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Internal Server Error",
			success: false,
		});
	}
};

// get reviews
export const getReviews = async (req, res) => {
	try {
		const reviews = await Review.find();
		if (!reviews.length) {
			return res.status(404).json({
				message: "No Review found!",
				success: false,
			});
		}

		res.status(200).json({
			message: "Reviews found!",
			reviews,
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server error" });
	}
};
