import mongoose from "mongoose";
import "dotenv/config";

const dbConnect = () => {
	mongoose
		.connect(process.env.MONGO_URI)
		.then(() => {
			console.log("Database Connected Successfully!");
		})
		.catch((error) => {
			console.log(error);
		});
};
export default dbConnect;
