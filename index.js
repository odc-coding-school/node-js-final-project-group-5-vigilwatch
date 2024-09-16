const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./database.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const app = express();
const PORT = 5000;
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
	session({
		secret: "Y6%#UBGHgfxf)88976CGFDR#4$RTYU",
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
	})
);

// Create a new session object with the user ID and secret key stored in the session object and save it to the session store.
app.use((req, res, next) => {
	res.locals.isRegistered = req.session.isRegistered;
	next();
});

// Our Routes
const homeRoutes = require("./routes/homeRoutes");
const contactRoutes = require("./routes/contactRoutes");
const chatRoutes = require("./routes/chat-route");
const userRoutes = require("./routes/userRoutes");
const successRoutes = require("./routes/successRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use("/", homeRoutes);
app.use("/contact", contactRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);
app.use("/success", successRoutes);
app.use("/report", reportRoutes);

app.get("/error", (req, res) => {
	const msg = req.query.msg || "There was an error sending your message.";
	res.render("errorEmail", { msg });
});

// Send email
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

app.get("/register", (req, res) => {
	res.render("register");
});
app.get("/login", (req, res) => {
	res.render("login");
});

// Register Route
app.post("/register", async (req, res) => {
	const { name, email, address, password } = req.body;

	try {
		db.query(
			"SELECT * FROM users WHERE email = ?",
			[email],
			async (err, results) => {
				if (results.length > 0) {
					return res.status(400).json({ message: "User already exists" });
				}

				const hashedPassword = await bcrypt.hash(password, 10);
				db.query(
					"INSERT INTO users (name, email, address, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
					[name, email, address, hashedPassword],
					(error, results) => {
						if (error) return res.status(500).json({ error });

						req.session.user = { id: results.insertId, email };
						res.redirect("/login");
					}
				);
			}
		);
	} catch (err) {
		res.status(500).json({ error: "Signup failed" });
	}
});

// Login Route
app.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		db.query(
			"SELECT * FROM users WHERE email = ?",
			[email],
			async (err, results) => {
				if (results.length === 0) {
					return res.render("login", { error: "Invalid email or password" });
				}

				const user = results[0];
				const isMatch = await bcrypt.compare(password, user.password);

				if (!isMatch) {
					return res.render("login", { error: "Invalid email or password" });
				}

				// Checking if user is registered
				req.session.isRegistered = true;
				req.session.user = {
					id: user.id,
					name: user.name,
					email: user.email,
					address: user.address,
					profilePic: user.profilePic,
				};

				res.redirect("/");
			}
		);
	} catch (err) {
		res.status(500).json({ error: "Login failed" });
	}
});

// Logout Route
app.post("/logout", (req, res) => {
	req.session.destroy(() => {
		res.redirect("/login");
	});
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
