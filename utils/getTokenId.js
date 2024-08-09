import jwt from "jsonwebtoken";
export const getUserId = async (token) => {
	if (!token) return;
	const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
	return decodedToken?.id;
};
