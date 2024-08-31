import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnect = () => {
	try {
		mongoose
			.connect(process.env.MONGO_URI)
			.then(() => {
				console.log("Database Connected Successfully!");
			})
			.catch((error) => {
				console.log(error);
			});
	} catch (error) {
		console.log(error);
	}
};
export default dbConnect;
