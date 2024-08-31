import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { Readable } from "stream";
import { Property } from "./models/propertyModel.js";
import dbConnect from "./utils/connectDB.js";

dbConnect();

// Static routes
const staticRoutes = [
	{ url: "/", changefreq: "daily", priority: 1.0 },
	{ url: "/about", changefreq: "monthly", priority: 0.7 },
	{ url: "/contact", changefreq: "monthly", priority: 0.7 },
	{ url: "/faq", changefreq: "monthly", priority: 0.7 },
	{ url: "/privacy-policy", changefreq: "monthly", priority: 0.7 },
	{ url: "/terms-conditions", changefreq: "monthly", priority: 0.7 },
	{ url: "/blog", changefreq: "weekly", priority: 0.8 },
	{ url: "/findpg", changefreq: "weekly", priority: 0.8 },
	{ url: "/signup", changefreq: "weekly", priority: 0.8 },
	{ url: "/login", changefreq: "weekly", priority: 0.8 },
];

// Function to generate dynamic routes
const generateDynamicRoutes = async () => {
	const propertyIds = await fetchPropertyIds();
	const dynamicRoutes = propertyIds.map((id) => ({
		url: `/property/${id}`,
		changefreq: "daily",
		priority: 0.8,
	}));
	return dynamicRoutes;
};

// Fetch property IDs from your database
const fetchPropertyIds = async () => {
	try {
		const properties = await Property.find();
		return properties.map((prop) => prop._id.toString());
	} catch (error) {
		console.error("Error fetching property IDs:", error);
		return [];
	}
};

// Generate sitemap
export const generateSitemap = async () => {
	try {
		if (!existsSync("./public")) {
			mkdirSync("./public");
		}

		// Get dynamic routes
		const dynamicRoutes = await generateDynamicRoutes();

		// Combine static and dynamic routes
		const links = [...staticRoutes, ...dynamicRoutes];

		// Create a sitemap stream
		const stream = new SitemapStream({
			hostname: "https://www.merapg.com/",
		});

		// Pipe the stream to write the sitemap.xml file
		const writeStream = createWriteStream("./public/sitemap.xml");

		streamToPromise(Readable.from(links).pipe(stream)).then((data) => {
			writeStream.write(data);
			writeStream.end();
		});

		// Listen for when the write stream finishes
		writeStream.on("finish", () => {
			console.log(
				"Sitemap has been generated and written to ./public/sitemap.xml"
			);
		});

		// Handle stream errors
		stream.on("error", (err) => {
			console.error("Error generating sitemap:", err);
		});

		writeStream.on("error", (err) => {
			console.error("Error writing sitemap file:", err);
		});
	} catch (error) {
		console.error("Error in sitemap generation process:", error);
	}
};

// Run the sitemap generation
generateSitemap().catch(console.error);
