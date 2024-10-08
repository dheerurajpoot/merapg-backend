import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import dbConnect from "./utils/connectDB.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import propertyRoute from "./routes/propertyRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import passport from "passport";
import session from "express-session";
import "./utils/passport.js";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import passportConfig from "./utils/passport.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dbConnect();

app.use(
	cors({
		origin: [
			"https://www.merapg.com",
			"https://merapg.com",
			"http://localhost:5173",
		],
		methods: "GET, POST, PATCH, DELETE, PUT",
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
	})
);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ extended: true, limit: "40mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
	session({
		secret: `${process.env.SESSION_SECRET}`,
		resave: false,
		saveUninitialized: false,
	})
);

app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

app.get("/", function (req, res) {
	res.send("Server is running...");
});

app.use("/api/user", userRoute);
app.use("/auth", authRoute);
app.use("/api/properties", propertyRoute);
app.use("/api/review", reviewRoute);

app.listen(process.env.PORT, () => {
	console.log(`Server is listening on port ${process.env.PORT}`);
});
