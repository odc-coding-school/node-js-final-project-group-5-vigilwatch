const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.USER_EMAIL,
		pass: process.env.PASSWORD,
	},
});

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
		to: [
			"torhshad09@gmail.com",
			"adukuly461@gmail.com",
			"princessangelvahn1@gmail.com",
		],
		subject: "New Incident Reported",
		text: `
            ${reporterName} just reported an incident:\n
            Location: ${location}\n
            Description: ${description}\n
            Incident Type: ${incidentType}\n
            Date: ${date}\n
            Image: ${image_path}
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Email sent successfully");
	} catch (error) {
		console.error("Error sending email:", error.message);
	}
};

module.exports = { sendNotification };
