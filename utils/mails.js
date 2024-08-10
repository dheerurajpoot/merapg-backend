import nodemailer from "nodemailer";

export const sendMail = async (data) => {
	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		secure: false, // Use `true` for port 465, `false` for all other ports
		auth: {
			user: process.env.MAIL_ID,
			pass: process.env.MAIL_PASS,
		},
	});
	const info = await transporter.sendMail({
		from: '"MeraPG" <merapgofficial@gmail.com>',
		to: data.to,
		subject: data.subject,
		text: data.text || "",
		html: data.html,
	});
};
