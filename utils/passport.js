import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/userModel.js";

const cloudClientId = process.env.GOOGLE_CLIENT_ID;
const cloudClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const passportConfig = (passport) => {
	passport.use(
		new GoogleStrategy(
			{
				clientID: cloudClientId,
				clientSecret: cloudClientSecret,
				callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const existingUser = await User.findOne({
						email: profile.emails[0].value,
					});
					if (existingUser) {
						return done(null, existingUser);
					}
					const newUser = new User({
						name: profile.displayName,
						email: profile.emails[0].value,
						profilePic: profile.photos[0].value || "",
						password: Date.now(), //dummy password
					});
					await newUser.save();
					done(null, newUser);
				} catch (error) {
					done(error, null);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const user = await User.findById(id);
			done(null, user);
		} catch (error) {
			done(error, false);
		}
	});
};

export default passportConfig;
