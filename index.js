import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import dbConnect from "./utils/connectDB.js";
import userRoute from "./routes/userRoute.js";

dbConnect();
app.use(
	express.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// cors
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.get("/", function (req, res) {
	res.send("Server is running...");
});

//api urls
app.use("/api/v1/user", userRoute);

app.listen(process.env.PORT, () => {
	console.log(`Server is listening on port ${process.env.PORT}`);
});
