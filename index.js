const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
const db = require('./database.js');
const app = express();
const PORT = 3000;
require("dotenv").config();



//middle wires
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//imported routes
const homeRoutes = require("./routes/homeRoutes");
const contactRoutes = require("./routes/contactRoutes");
const chatRoutes = require('./routes/chat-route')

app.use("/", homeRoutes);
app.use("/contact", contactRoutes);
app.use('/chat', chatRoutes)

// Define success and error routes here
app.get("/success", (req, res) => {
	const msg = req.query.msg || "Your message has been sent!";
	res.render("successEmail", { msg });
});

<<<<<<< HEAD
app.get("/report", (req, res) => {
	res.render("report.ejs");
});

=======
app.get("/error", (req, res) => {
	const msg = req.query.msg || "There was an error sending your message.";
	res.render("errorEmail", { msg });
});

app.post("/send-message", (req, res) => {
	const { name, email, message } = req.body;

	if (!email || !name || !message) {
		return res.status(400).send("All fields are required.");
	}

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.USER_EMAIL,
			pass: process.env.PASSWORD,
		},
	});

	const mailOptions = {
		from: `"${name}" <${email}>`,
		to: process.env.USER_EMAIL,
		subject: `Message from ${name}`,
		text: message,
		replyTo: email,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email:", error);
			return res
				.status(500)
				.redirect("/error?msg=Error occurred while sending email.");
		}
		console.log("Email sent:", info.response);
		res.redirect(
			"/success?msg=Your message has been sent! We'll get back to you shortly."
		);
	});
});

app.get('/register', (req, res)=>{
	res.render('register')
})

app.get('/login', (req, res)=>{
	res.render('login')
})

>>>>>>> fedd978734d25c6c1587f8e6953e766001afcea0
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
