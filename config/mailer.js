const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.USER_EMAIL,
		pass: process.env.PASSWORD,
	},
});

// "adukuly461@gmail.com";

// const sendNotification = async ({
// 	location,
// 	description,
// 	incidentType,
// 	image_path,
// 	date,
// 	reporterName,
// }) => {
// 	const mailOptions = {
// 		from: process.env.USER_EMAIL,
// 		to: ["torhshad09@gmail.com"],
// 		subject: "New Incident Reported",
// 		text:
// 			`${reporterName} just reported an incident:\n\n` +
// 			`Location: ${location}\n` +
// 			`Description: ${description}\n` +
// 			`Incident Type: ${incidentType}\n` +
// 			`Date: ${date}\n` +
// 			`image :${image_path}`,
// 	};

// 	try {
// 		await transporter.sendMail(mailOptions);
// 		console.log("Email sent successfully");
// 	} catch (error) {
// 		console.error("Error sending email:", error);
// 	}
// };

const sendNotification = async ({
	location,
	description,
	incidentType,
	image_path,
	date,
	reporterName,
}) => {
	const mailOptions = {
		from: process.env.USER_EMAIL,
		to: ["torhshad09@gmail.com"],
		subject: "New Incident Reported",
		text:
			`${reporterName} just reported an incident:\n\n` +
			`Location: ${location}\n` +
			`Description: ${description}\n` +
			`Incident Type: ${incidentType}\n` +
			`Date: ${date}\n`,
		attachments: [
			{
				filename: image_path.split("/").pop(), // Get the filename from the path
				path: image_path, // Path to the image
				cid: "incidentImage", // Attach a unique CID for embedding
			},
		],
		html: `<p>${reporterName} just reported an incident:</p>
			<p><strong>Location:</strong> ${location}</p>
			<p><strong>Description:</strong> ${description}</p>
			<p><strong>Incident Type:</strong> ${incidentType}</p>
			<p><strong>Date:</strong> ${date}</p>
			<p><img src="cid:incidentImage" alt="Incident Image" /></p>`, // Embed the image using CID
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Email sent successfully");
	} catch (error) {
		console.error("Error sending email:", error);
	}
};

module.exports = { sendNotification };
