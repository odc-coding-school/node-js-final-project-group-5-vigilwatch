const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./database.js");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash")
const session = require("express-session");
const rateLimit = require('express-rate-limit');
const { sendNotification } = require("./config/mailer.js");
const setupSocketIO = require("./routes/socketIo-route.js");
const { formatDistanceToNow } = require("date-fns");
const axios = require("axios");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;
require("dotenv").config();


//middlewire to delay the limit
// const limiter = 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
	session({
		secret: process.env.secret,
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
	})
);
app.use(flash())

app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success")
	res.locals.error_msg = req.flash("error")
	next()
})
// Multer for handling image uploads
const storage = multer.diskStorage({
	destination: "./public/uploads/",
	filename: (req, file, cb) => {
		cb(
			null,
			file.fieldname + "-" + Date.now() + path.extname(file.originalname)
		);
	},
});
const upload = multer({ storage: storage }).single("imageUpload");

// Create a new session object with the user ID and secret key stored in the session object and save it to the session store.
app.use((req, res, next) => {
	res.locals.isRegistered = req.session.isRegistered;
	next();
});

// Our Routes
const homeRoutes = require("./routes/homeRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const successRoutes = require("./routes/successRoutes");
const reportRoutes = require("./routes/reportRoutes");
const locationRoutes = require("./routes/location.js");
const analyticsRoutes = require("./routes/analyticsRoutes");
const newsRoutes = require("./routes/newsRoutes");
const policyRoutes = require("./routes/policyRoutes");
const termsOfServiceRoutes = require("./routes/termsOfServiceRoutes");
const loginUserRoute = require("./routes/api.js");
const incidentSuccessRoutes = require("./routes/incidentSuccessRoutes");
const registeredUsers = require("./middleware/auth");
const isAdmin = require("./middleware/isAdmin");
const mapRoute = require("./routes/map-route.js");

// Import twilio library
const twilio = require('twilio');
const AccountSID = process.env.ACCOUNT_SID;
const AuthTOKEN = process.env.AUTH_TOKEN;

app.use("/", homeRoutes);
app.use("/contact", contactRoutes);
app.use("/user", userRoutes);
app.use("/success", successRoutes);
app.use("/report", reportRoutes);
app.use("/location", locationRoutes);
app.use("/api", loginUserRoute);
app.use("/analytics", analyticsRoutes);
app.use("/", newsRoutes);
app.use("/policy", policyRoutes);
app.use("/termsOfService", termsOfServiceRoutes);
app.use("/incident-success", incidentSuccessRoutes);
app.use('/map', mapRoute);



//setting up the otp

// create Client for Twilio;
const client = twilio(AccountSID, AuthTOKEN);

//Send SMS function
const sendSMS = (receipient, sender, body) => {
	client.messages.create({
		to: receipient,
		from: sender,
		body: body,
	})
		.then(message => {
			console.log("message sent successfully", message.sid);
		})
		.catch(error => {
			console.log("Error sending message", error);
		})
}

// Route to get specific news item by id
app.get("/news/:id", async (req, res) => {
	const user = req.session.user || null;
	const newsId = req.params.id;

	try {
		const [news] = await db
			.promise()
			.query("SELECT * FROM news WHERE id = ?", [newsId]);

		if (news.length > 0) {
			// If news item is found, render a template with the news details
			res.render("singleNew", { news: news[0], user });
		} else {
			// If no news found, send a 404 response
			res.status(404).send("News not found");
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Server Error");
	}
});

app.get("/news", async (req, res) => {
	const user = req.session.user || null;
	try {
		// Fetching the news from the database
		const [news] = await db
			.promise()
			.query("SELECT * FROM news ORDER BY created_at DESC");

		// Rendering the news view and pass the news data to the template file
		res.render("news", { modifiedNews: news, user, isRegistered: !!req.session.user });
	} catch (error) {
		console.error(error);
		res.status(500).send("Server Error");
	}
});

// Route to fetch and display the news
app.get("/admin/news/import", isAdmin, (req, res) => {
	const user = req.session.user || null;
	res.render("importNews", { user, isRegistered: !!req.session.user }); // Render the news page
});

// news end
// app.get("/user/profile", registeredUsers, async (req, res) => {
// 	const userId = req.session.user.id;

// 	try {
// 		// Fetch user data
// 		const [user] = await db
// 			.promise()
// 			.query(
// 				"SELECT full_name, profilePic, user_address FROM users WHERE id = ?",
// 				[userId]
// 			);

// 		// Count reported incidents
// 		const [reportedIncidents] = await db
// 			.promise()
// 			.query(
// 				"SELECT COUNT(*) as count FROM incidents WHERE userId = ? AND status = 'confirmed'",
// 				[userId]
// 			);
// 		console.log(
// 			`Reported Incidents for userId ${userId}:`,
// 			reportedIncidents[0].count
// 		);

// 		// Count pending incidents
// 		const [pendingIncidents] = await db
// 			.promise()
// 			.query(
// 				"SELECT COUNT(*) as count FROM incidents WHERE userId = ? AND status = 'pending'",
// 				[userId]
// 			);
// 		console.log(
// 			`Pending Incidents for userId ${userId}:`,
// 			pendingIncidents[0].count
// 		);

// 		// Send JSON response
// 		res.json({
// 			user: user[0],
// 			reportedCount: reportedIncidents[0].count,
// 			pendingCount: pendingIncidents[0].count,
// 		});
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).send("Server Error");
// 	}
// });

app.get("/user/profile", registeredUsers, async (req, res) => {
	const userId = req.session.user.id;
	const userRole = req.session.user.role;



	try {
		// Fetch user data
		const [user] = await db
			.promise()
			.query(
				"SELECT full_name, profilePic, user_address FROM users WHERE id = ?",
				[userId]
			);

		console.log(user);


		// Count reported incidents
		const [reportedIncidents] = await db
			.promise()
			.query(
				"SELECT COUNT(*) as count FROM incidents WHERE userId = ? AND status = 'confirmed'",
				[userId]
			);

		// Count pending incidents
		const [pendingIncidents] = await db
			.promise()
			.query(
				"SELECT COUNT(*) as count FROM incidents WHERE userId = ? AND status = 'pending'",
				[userId]
			);


		const latestNews = await db.promise().query(
			`SELECT * FROM incidents join users on(users.id=incidents.userId) WHERE created_at >= now() - INTERVAL 3 DAY ORDER BY created_at DESC LIMIT 4;
		`, [userId]);




		db.query(
			`SELECT * FROM incidents WHERE userId =?`,
			[userId],
			(err, userReportedCrime) => {
				if (err) throw err;


				// Render the user profile using EJS
				res.render("profile", {
					user: user[0],
					reportedCount: reportedIncidents[0].count,
					pendingCount: pendingIncidents[0].count,
					userReportedCrime: userReportedCrime,
					latestNewsFetched: latestNews[0],
					userRole,
					isRegistered: !!req.session.user
				});
			}
		);



	} catch (error) {
		console.error(error);
		res.status(500).send("Server Error");
	}
});

//admin route
// app.get("/admin", isAdmin, (req, res) => {
// 	const user = req.session.user || null;
// 	const userQuery = "SELECT id, full_name, email, role FROM users"; // All users
// 	const incidentQuery = "SELECT * FROM incidents"; // All incidents

// 	db.query(userQuery, (err, users) => {
// 		if (err) return res.status(500).send("Error retrieving users.");

// 		db.query(incidentQuery, (err, incidents) => {
// 			if (err) return res.status(500).send("Error retrieving incidents.");

// 			res.render("admin-dashboard", { users, incidents, user });
// 		});
// 	});
// });

app.post("/admin/promote", isAdmin, (req, res) => {
	const userId = req.body.userId;
	const query = "UPDATE users SET role = 1 WHERE id = ?";

	db.query(query, [userId], (err, result) => {
		if (err) return res.status(500).send("Error promoting user to admin.");
		res.redirect("/user-management");
	});
});

// ================Dashboard Render=============// 
app.get("/admin-dashboard", isAdmin, async (req, res) => {
	const user = req.session.user || null;
	const userId = req.session.user.id;

	const userQuery = "SELECT id, full_name, email, role FROM users"; // All users
	const incidentQuery = "SELECT * FROM incidents"; // All incidents
	const countQuery = "SELECT COUNT(*) AS userCounts FROM users "; //number of the registered users
	const importedNewsQuery= "SELECT COUNT(*) AS userCounts FROM news "; //number of the Imported News

	
	// Count reported incidents
	const [reportedIncidents] = await db
		.promise()
		.query(
			"SELECT COUNT(*) as count FROM incidents WHERE status = 'confirmed'"
		);

	// Count pending incidents
	const [pendingIncidents] = await db
		.promise()
		.query(
			"SELECT COUNT(*) as count FROM incidents WHERE status = 'pending'"
		);


	const [userCount] = await db.promise().query(countQuery);
	const [newsCount] = await db.promise().query(importedNewsQuery);
	console.log(reportedIncidents[0].count);
	console.log(pendingIncidents[0].count);


	db.query(userQuery, (err, users) => {
		if (err) return res.status(500).send("Error retrieving users.");

		db.query(incidentQuery, (err, incidents) => {
			if (err) return res.status(500).send("Error retrieving incidents.");

			res.render("admin-dashboard", {
				users, incidents, user,
				userCount: userCount[0].userCounts,
				newsCount: newsCount[0].userCounts,
				reportedReported: reportedIncidents[0].count,
				pendingIncidents: pendingIncidents[0].count,
				isRegistered: !!req.session.user
			});
		});
	});



});

// ================User management Render=============// 
app.get("/user-management", isAdmin, (req, res) => {
	const user = req.session.user || null;
	const userQuery = "SELECT id, full_name, email, role FROM users"; // All users
	const incidentQuery = "SELECT * FROM incidents"; // All incidents

	db.query(userQuery, (err, users) => {
		if (err) return res.status(500).send("Error retrieving users.");

		db.query(incidentQuery, (err, incidents) => {
			if (err) return res.status(500).send("Error retrieving incidents.");

			res.render("user-management", { users, incidents, user, isRegistered: !!req.session.user });
		});
	});

});

// ================Incidents management Render=============// 
app.get("/incidents", isAdmin, async (req, res) => {
	const user = req.session.user || null;
	const userQuery = "SELECT id, full_name, email, role FROM users"; // All users
	const incidentQuery = "SELECT * FROM incidents"; // All incidents
	const countQuery = "SELECT COUNT(*) AS incidentCount FROM incidents ";

	const [userCount] = await db.promise().query(countQuery);


	console.log(userCount[0].incidentCount);


	db.query(userQuery, (err, users) => {
		if (err) return res.status(500).send("Error retrieving users.");

		db.query(incidentQuery, (err, incidents) => {
			if (err) return res.status(500).send("Error retrieving incidents.");

			res.render("incidents", { users, incidents, user, count: userCount[0].incidentCount, isRegistered: !!req.session.user });
		});
	});

});

app.post("/admin/confirm-incident", isAdmin, (req, res) => {
	const incidentId = req.body.incidentId;
	const query = "UPDATE incidents SET status = 'confirmed' WHERE id = ?";

	db.query(query, [incidentId], (err, result) => {
		if (err) return res.status(500).send("Error confirming incident.");
		res.redirect("/admin-dashboard");
	});
});

app.post("/admin/delete-incident", isAdmin, (req, res) => {
	const incidentId = req.body.incidentId;
	const query = "DELETE FROM incidents WHERE id = ?";

	db.query(query, [incidentId], (err, result) => {
		if (err) return res.status(500).send("Error deleting incident.");
		res.redirect("/admin-dashboard");
	});
});

app.get("/error", (req, res) => {
	const msg = req.query.msg || "There was an error sending your message.";
	res.render("errorEmail", { msg });
});

app.post("/set-alert", (req, res) => {
	req.session.hasAlerted = true; // User has clicked "Get Alert"
	res.json({ success: true });
});

app.post("/disable-alert", (req, res) => {
	req.session.hasAlerted = false; // User has clicked "Disable Alert"
	res.json({ success: true });
});

// Get Reported Incidents
app.get("/get-reported-incidents", (req, res) => {
	const query = "SELECT * FROM incidents WHERE status = 'confirmed'"; // Adjust the query as needed
	db.query(query, (err, results) => {
		if (err) throw err;
		res.json({ incidents: results });
	});
});

// to get user location

app.get("/get-user-location", async (req, res) => {
	if (!req.session.user || !req.session.user.id) {
		return res.status(401).json({ message: "User not logged in" });
	}

	const userId = req.session.user.id;
	const query = "SELECT user_address FROM users WHERE id = ?";

	try {
		const [result] = await db.promise().query(query, [userId]);
		if (result.length === 0) {
			return res.status(404).json({ message: "User location not found" });
		}
		const userLocation = result[0].user_address;
		res.json({ location: userLocation });
	} catch (err) {
		console.error("Error fetching user location:", err);
		res.status(500).json({ message: "Database error" });
	}
});

app.post("/update-location", (req, res) => {
	const user = req.session.user || null;
	const { address } = req.body;

	const userQuery = `UPDATE users SET user_address =?  WHERE id = ?`;
	db.query(userQuery, [address, user.id], (err, result) => {


		console.log(result);

		req.session.user.user_address = address;
		req.flash('success', "location change sucessfully!")
		res.redirect('/user/profile')

	});




})


app.post("/submit-incident", async (req, res) => {
	upload(req, res, async (err) => {
		try {
			if (err) {
				return res.send("Error uploading file");
			}

			const { userId, incidentType, description, incidentDate, location } =
				req.body


			// Fetch user's registered location
			const userQuery = "SELECT user_address FROM users WHERE id = ?";
			const [userResult] = await db.promise().query(userQuery, [userId]);
			const userLocation = userResult[0] ? userResult[0].user_address : null;
			const nameQuery = "SELECT full_name FROM users WHERE id = ?";
			const [reporter] = await db.promise().query(nameQuery, [userId]);
			const reporterName = reporter[0] ? reporter[0].full_name : "Unknown";


			// if (userLocation && location !== userLocation) {
			// 	return res
			// 		.status(400)
			// 		.send(
			// 			"Error: The location entered doesn't match your registered location."
			// 		);
			// }

			// geting the user geolocation from open cage
			// // // opencage Geo API URL
			const openCageURL = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)},+Liberia&key=${process.env.HUBWATCH_OPEN_CAGE_APIKEY}&language=en&pretty=1`;
			const response = await axios.get(openCageURL);
			const result = response.data;

			if (result.length !== 0) {
				console.log(result);

				const location_lat = result.results[0].geometry.lat;
				const location_lng = result.results[0].geometry.lng;

				// // Proceed with inserting the incident
				const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

				const user = req.session.user;
				const incidentsInsert =
					"INSERT INTO incidents (incident_type, description, incident_date, location, image_path, userId, location_lat, location_lng) VALUES (?, ?, ?, ?, ?, ?, ?,?)";
				const values = [
					incidentType,
					description,
					incidentDate,
					location,
					imagePath,
					user.id,
					location_lat,
					location_lng
				];

				// Sending the sms to the Admin that a user just reported a crime
				// sendSMS(user.phone_number, process.env.VERIFIED_PHONE, `${user.full_name} just reported a crime from ${location}`);


				await db.promise().query(incidentsInsert, values);

				sendNotification({
					reporterName,
					location,
					description,
					incidentType,
					date: incidentDate,
					image_path: imagePath,
				});

				// // Increment the notification count in session
				req.session.notificationCount = (req.session.notificationCount || 0) + 1;

				res.redirect("/incident-success");
			}
		}

		catch (error) {
			console.error("Error reporting incident:", error);
			res.status(500).json({ message: "Error reporting incident" });
		}
	});
});

app.post("/send-message", (req, res) => {
	const { name, email, message } = req.body;
	const user = req.session.user || null;

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
			"/success?msg=Your message has been sent! We'll get back to you shortly.",
			{ user }
		);
	});
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.get("/login", (req, res) => {
	const user = req.session.user || null;
	res.render("login", { user });
});

app.get("/verify-number", registeredUsers, (req, res) => {
	res.render('verify-number')
})


const regex = /^[\d+]+$/;
const countryCode = "+231";

// Register Route
app.post("/register", async (req, res) => {
	const { full_name, email, address } = req.body;
	let phoneNumber = req.body.number;

	//removing the zero from the phone number
	const splicePhoneNumber = phoneNumber.slice(1);

	//formating the number to have country code
	const formatedPhoneNumber = `${countryCode}${splicePhoneNumber}`;

	console.log(formatedPhoneNumber);

	try {
		//checke if email exist in the user table
		db.query(
			"SELECT * FROM users WHERE email = ?",
			[email],
			async (err, results) => {

				// Checking if Email Exist in the datadase
				if (results.length > 0) {
					return res.status(409).render("register", { errorMessage: "Email already exists" });
				}

				// checking if Phone number exist
				db.query(
					"SELECT * FROM users WHERE phone_number = ?",
					[formatedPhoneNumber],
					async (err, result) => {
						if (err) return res.json(err.message);

						if (result.length !== 0) {
							return res.render('register', { wrongNumberFormat: "Phone Number aleady exist" });
						} else {

							if (!regex.test(formatedPhoneNumber) || formatedPhoneNumber.length > 13 || formatedPhoneNumber.length < 13) {
								return res.render('register', { wrongNumberFormat: "Field must contains only numbers with 12 character." });
							} else {
								//check if location exist in room table
								const query = "SELECT * FROM room WHERE address =?";
								db.query(query, [address], (err, result) => {
									if (err) return res.json(err.message);

									const query =
										`INSERT INTO users 
										(full_name, email, user_address, phone_number,
										otp_number, room_id) VALUES(?, ?, ?, ?, ?, ?) ON DUPLICATE KEY 
										UPDATE otp_number=?
									`;

									//assigning the exist room id to the user.room_id
									let roomID;

									//OTP number
									const otpNumber = Math.floor(100000 + Math.random() * 900000);

									console.log(otpNumber);


									if (result.length !== 0) {
										roomID = result[0].room_id;

										db.query(
											query,
											[full_name, email, address, formatedPhoneNumber, otpNumber, roomID, otpNumber],
											(err, result) => {
												if (err) return res.json(err.message);
												res.render("login");
											}
										);

									} else {
										const query = "INSERT INTO room(address) VALUES(?)";
										db.query(query, [address], (err, result) => {
											if (err) return res.json(err.message);
											//assigning the inserted room id to the user.room_id
											roomID = result.insertId;

											//inserting into the user table if the room address do not exist
											const query =
												`INSERT INTO users 
												(full_name, email, user_address, phone_number, otp_number, room_id) VALUES(?, ?, ?, ?, ?, ?)
												ON DUPLICATE KEY UPDATE otp_number=?
											`;
											db.query(
												query,
												[full_name, email, address, formatedPhoneNumber, otpNumber, roomID, otpNumber],
												(err, result) => {
													if (err) return res.json(err.message);
													res.render("login");
												}
											);
										});
									}


								});
							}
						}
					}
				)


			}

		);
	} catch (err) {
		res.status(500).json({ error: "Signup failed" });
	}

});


// Login Route
app.post("/login", async (req, res) => {
	const { phoneNumber } = req.body;

	try {
		//removing the zero from the phone number
		const splicePhoneNumber = phoneNumber.slice(1);
		//formating the number to have country code
		const formatedPhoneNumber = `${countryCode}${splicePhoneNumber}`;


		db.query(
			`SELECT * FROM users WHERE phone_number=?`,
			[formatedPhoneNumber],
			(err, result) => {
				if (err) return console.log(err.message);

				if (result.length === 0) {
					// registeredNumber
					res.render('login', { error: "Phone number is not registered." })
					req.session.user = null
				} else {
					// sendSMS(formatedPhoneNumber, process.env.VERIFIED_PHONE, `Your VigilWatch Verification Code is ${result[0].otp_number}`);
					res.status(200).render('verify-number')
				}

			}
		)

	}
	catch (error) {
		res.json({ error: "Login Failed" })
	}


	// try {
	// 	db.query(
	// 		"SELECT * FROM users WHERE email = ?",
	// 		[email],
	// 		async (err, results) => {
	// 			if (results.length === 0) {
	// 				return res.render("login", { error: "Invalid email or password" });
	// 			}

	// 			const user = results[0];
	// 			const isMatch = await bcrypt.compare(password, user.password);

	// 			if (!isMatch) {
	// 				return res.status(401).render("login", { error: "Invalid email or password" });
	// 			}

	// 			// Checking if user is registered
	// 			req.session.isRegistered = true;
	// 			// console.log(req.session.user = user);

	// 			req.session.user = {
	// 				id: user.id,
	// 				name: user.full_name,
	// 				email: user.email,
	// 				address: user.address,
	// 				room_id: user.room_id,
	// 				profilePic: user.profilePic,
	// 				role: user.role, // Add the role field here
	// 			};

	// 			res.redirect("http://localhost:5000/");
	// 		}
	// 	);
	// } catch (err) {
	// 	res.status(500).json({ error: "Login failed" });
	// }
});

// Verify Phone Route
app.post("/verify-number", (req, res) => {
	const { otpNumber } = req.body;

	console.log(otpNumber);

	db.query(
		`SELECT * FROM users WHERE otp_number =?`,
		[otpNumber],
		(err, result) => {
			if (err) return res.json(err.message);

			let user;

			if (result.length > 0) {
				user = result[0];
				req.session.user = user;
				console.log(req.session.user);
				res.redirect('http://localhost:5000');
			} else {
				req.session.user = null;
				console.log(req.session.user);
				
				res.render('verify-number', { error: 'The code you entered is invalid' })
			}
		}
	)
})


// Resend OTP Code
app.post('/resend-code', (req, res) => {
	const user = req.session.user;

	const oldOtpNumber = user.otp_number;
	const phoneNumber = user.phone_number;
	//OTP number
	const newOTPNumber = Math.floor(100000 + Math.random() * 900000);

	// {
	//   id: 10,
	//   full_name: 'Abraham Dukuly',
	//   email: 'adukuly461@gmail.com',
	//   user_address: 'Caldwell',
	//   phone_number: '+231886828747',
	//   otp_number: '388290',
	//   room_id: 3,
	//   profilePic: null,


	try {
		db.query(
			`SELECT otp_number FROM users WHERE otp_number =? `,
			[oldOtpNumber],
			(err, result) => {
				if (err) throw err;
				// Updating the otp code in the database and resending a new code
				if (result.length > 0) {
					db.query(
						`UPDATE users SET otp_number =? WHERE phone_number =?`,
						[newOTPNumber, phoneNumber],
						(err, result) => {
							if (err) throw err.message;

							// Updating the new OTP number ont
							req.session.user.otp_number = newOTPNumber;

							sendSMS(phoneNumber, process.env.VERIFIED_PHONE, `Your VigilWatch Verification Code is ${newOTPNumber}`);
							res.render('verify-number');
						}
					)
				} else {

				}

			}
		)

	} catch (error) {
		console.error("Failed to Resend OTP code")
	}
})

// Logout Route
app.post("/logout", (req, res) => {
	req.session.destroy(() => {
		res.redirect("http://localhost:5000/login");
	});
});


app.get("/search/:query", (req, res) => {
	const param = req.params.query;


	console.log(param);

	const query = `	SELECT * FROM incidents WHERE location LIKE ? limit 5;
`;

	db.query(query, [`%${param}%`], (err, result) => {
		if (err) return res.json(err.message);

		if (result.length === 0) return res.json('No result found')
		return res.json(result);
	})
})



const server = app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

const io = setupSocketIO(server);

app.get("/chat", (req, res) => {
	const roomID = req.session.user.room_id;
	const userID = req.session.user.id;
	const userName = req.session.user.name;

	const user = req.session.user || null;
	res.render("chat", { user, isRegistered: !!req.session.user });
});

// Handle socket connection inside the chat route
io.on("connection", (socket) => {
	// Join the group by the group ID
	socket.on("join-room", roomID => {
		socket.join(roomID);

		// fetching existing messages from the mrssage table
		const query = `
			SELECT u.id, u.full_name, u.email, u.room_id,
			u.profilePic AS user_profile, m.message_id,
			m.user_id, m.room_id, m.message_type, m.messaged_time
			FROM users AS u
			JOIN messages AS m ON (m.user_id = u.id)
			WHERE m.room_id = ? ORDER BY m.messaged_time ASC
		`;
		db.query(query, [roomID], (err, previousMessages) => {
			if (err) throw err;

			let existingMessages = { message: [] };
			previousMessages.forEach((prevMessage) => {
				const messagedTime = new Date(prevMessage.messaged_time);
				const timeAgo = formatDistanceToNow(messagedTime, {
					addSuffix: true,
				});

				existingMessages.message.push({
					email: prevMessage.email,
					fullName: prevMessage.full_name,
					id: prevMessage.id,
					messageType: prevMessage.message_type,
					messageTime: timeAgo,
					roomId: prevMessage.room_id,
					userId: prevMessage.user_id,
					profile: prevMessage.user_profile,
				});

			});

			// Emit previous messages to the user
			socket.emit("previous-message", existingMessages);
		});
	});

	// Sending messages to all members
	socket.on("send-message", (data) => {

		const query =
			"INSERT INTO messages(user_id, room_id, message_type) VALUES(?,?,?)";
		db.query(query, [data.userID, data.roomID, data.message], (err) => {
			if (err) return res.json(err.message);

			const profileQuery =
				"SELECT users.id, users.profilePic, users.full_name FROM users WHERE id = ?";
			db.query(profileQuery, [data.userID], (err, userProfile) => {
				if (err) throw err;

				// Emit new message to all members except the sender
				socket.to(data.roomID).emit("new-message", {
					userId: data.userID,
					roomId: data.roomID,
					newMessage: data.message,
					userProfile: userProfile[0].profilePic, // Optional chaining to avoid errors
					userName: userProfile[0].full_name,
				});



				//Emit new message to the senders
				socket.emit("new-message", {
					userId: data.userID,
					roomId: data.roomID,
					newMessage: data.message,
					userProfile: userProfile[0].profilePic, // Optional chaining to avoid errors
					userName: userProfile[0].full_name,
				});
			});
		});


	});

	// Handle user disconnection
	socket.on("disconnect", () => {
		console.log("user disconnected from the chat");
	});
});
