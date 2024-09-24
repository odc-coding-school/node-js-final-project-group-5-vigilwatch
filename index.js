const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./database.js");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const setupSocketIO = require("./routes/socketIo-route.js");
const { formatDistanceToNow } = require("date-fns");




const app = express();

const PORT = 5000;
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())

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
const loginUserRoute = require("./routes/api.js")


app.use("/", homeRoutes);
app.use("/contact", contactRoutes);
app.use("/user", userRoutes);
app.use("/success", successRoutes);
app.use("/report", reportRoutes);
app.use("/location", locationRoutes);
app.use('/api', loginUserRoute)
app.use("/analytics", analyticsRoutes);
app.use("/news", newsRoutes);
app.use("/policy", policyRoutes);
app.use("/termsOfService", termsOfServiceRoutes);

app.get("/error", (req, res) => {
	const msg = req.query.msg || "There was an error sending your message.";
	res.render("errorEmail", { msg });
});

// Handle form submission
app.post("/submit-incident", (req, res) => {
	upload(req, res, (err) => {
		if (err) {
			res.send("Error uploading file");
		} else {
			const { incidentType, description, incidentDate, location } = req.body;
			const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

			const incidentsInsert =
				"INSERT INTO incidents (incident_type, description, incident_date, location, image_path) VALUES (?, ?, ?, ?, ?)";
			const values = [
				incidentType,
				description,
				incidentDate,
				location,
				imagePath,
			];

			db.query(incidentsInsert, values, (err, result) => {
				if (err) throw err;
				res.send("Incident reported successfully");
			});
		}
	});
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
	const { full_name, email, address, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		//checke if email exist in the user table
		db.query(
			"SELECT * FROM users WHERE email = ?",
			[email],
			async (err, results) => {
				if (results.length > 0) {
					return res.status(400).json({ message: "User already exists" });
				}

				//check if location exist in room table
				const query = "SELECT * FROM room WHERE address =?";
				db.query(query, [address], (err, result) => {
					if (err) return res.json(err.message);
					const query = `INSERT INTO users 
						(full_name, email, password, user_address, room_id) VALUES(?,?,?,?,?)
					`;

					//assigning the exist room id to the user.room_id
					let roomID;

					if (result.length !== 0) {
						roomID = result[0].room_id;
						db.query(
							query,
							[full_name, email, hashedPassword, address, roomID],
							(err, result) => {
								if (err) return res.json(err.message);
								res.redirect("/login");
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
								"INSERT INTO users (full_name, email, password, user_address, room_id) VALUES(?,?,?,?,?)";
							db.query(
								query,
								[full_name, email, hashedPassword, address, roomID],
								(err, result) => {
									if (err) return res.json(err.message);
									res.redirect("/login");
								}
							);
						});
					}
				});
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
				// console.log(req.session.user = user);

				req.session.user = {
					id: user.id,
					name: user.name,
					email: user.email,
					address: user.address,
					room_id: user.room_id,
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

const server = app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

const io = setupSocketIO(server);

app.get('/chat', (req, res) => {
	const roomID = req.session.user.room_id;
	const userID = req.session.user.id;
	const user = req.session.user || null;

	res.render('chat', { user, isRegistered: !!req.session.user })


	io.on("connection", (socket) => {
		console.log(socket.id);


		//join the group by the group ID
		socket.on("join-room", (roomID) => {
			socket.join(roomID);

			const query = `
				SELECT u.id, u.full_name, u.email, u.room_id,
				 	u.profilePic As user_profile, m.message_id,
                    m.user_id, m.room_id, m.message_type, m.messaged_time FROM users AS u JOIN
					messages AS m ON(u.room_id = m.room_id) WHERE m.room_id = ?;
				`;

			db.query(query, [roomID], (err, PreviousMessage) => {
				if (err) throw err;
				//variable to hold the previous message
				let existingMessage = { message: [] };


				//iterating over the previousmessage array return from the database
				PreviousMessage.forEach((prevMessage) => {

					//formating the date to time ago using data-fns
					const messagedTime = new Date(prevMessage.messaged_time);
					const timeAgo = formatDistanceToNow(messagedTime, {
						addSuffix: true
					})
					console.log(timeAgo);


					existingMessage.message.push({
						email: prevMessage.email,
						fullName: prevMessage.full_name,
						id: prevMessage.id,
						messageType: prevMessage.message_type,
						messageTime: timeAgo,
						roomId: prevMessage.room_id,
						userId: prevMessage.user_id,
						profile: prevMessage.user_profile
					})
				})

				// socket.to(roomID).emit("previous-message", existingMessage);
				socket.emit("previous-message", existingMessage);

			})

		})



		//sending the messages to the all members
		socket.on("send-message", (data) => {
			
			const query = "INSERT INTO messages(user_id, room_id, message_type) VALUES(?,?,?)"
			db.query(query, [data.userID, data.roomID, data.message], (err, result) => {
				if (err) return res.json(err.message);
			})

			//query to attach the user profilet to the previous message base on the id
			const profileQuery = `SELECT users.id, users.profilePic, 
			users.user_address FROM users WHERE id = ?`;
			db.query(profileQuery, [data.userID], (err, userProfile) => {
				if (err) throw err;

				//sending message to all members in the group except the senders
				// socket.to(roomID).emit("new-message", ({
				// 	userId: data.userID,
				// 	roomId: data.roomID,
				// 	newMessage: data.message,
				// 	userProfile: userProfile[0].profilePic
				// }))

				//sending message to only the senders
				socket.broadcast.emit("new-message", ({
					userId: data.userID,
					roomId: data.roomID,
					newMessage: data.message,
					userprofile: userProfile[0].profilePic
				}))

				// console.log({userid:data.userID, roomid:data.roomID, 
				// 	message:data.message, userprofile:userProfile});
				
			})


		});



		socket.on("disconnect", () => {
			console.log(`A user with ${userID} and group id ${roomID} has disconnected`);

		})
	})

})
