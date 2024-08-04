import jwt from "jsonwebtoken";
export const getUserId = async (token) => {
	if (!token) {
		return res
			.status(401)
			.json({ message: "Authentication Failed, Login Again!" });
	}
	const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
	return decodedToken?.userID;
};
