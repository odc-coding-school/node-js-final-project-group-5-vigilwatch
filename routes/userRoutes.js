const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../database.js");
const router = express.Router();

// this  Configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadFolder = "public/uploads";
		// Check if the directory exists, if not create it
		if (!fs.existsSync(uploadFolder)) {
			fs.mkdirSync(uploadFolder, { recursive: true });
		}
		cb(null, uploadFolder);
	},
	filename: function (req, file, cb) {
		// Appending the current timestamp to avoid file name conflicts
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: function (req, file, cb) {
		const filetypes = /jpeg|jpg|png|svg/;
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = filetypes.test(file.mimetype);

		if (extname && mimetype) {
			cb(null, true);
		} else {
			cb(new Error("Error: Images Only!"));
		}
	},
});

// Middleware to check if user is authenticated before adding profilePic
const ensureAuthenticated = (req, res, next) => {
	if (req.session && req.session.user) {
		// Check if session and user exist
		return next(); // Proceed to next middleware/route handler
	}
	res.redirect("/login"); // Redirect to login if not authenticated
};

//this is the Route for uploading profile image
router.post(
	"/upload-profile",
	ensureAuthenticated,
	upload.single("profilePic"), // Handle single file upload with "profilePic" field name
	async (req, res) => {
		try {
			const userId = req.session.user.id;

			if (!req.file) {
				// Check if a file is uploaded
				return res.status(400).send("No file uploaded or invalid file type.");
			}

			const profilePicPath = `/uploads/${req.file.filename}`; // Construct file path

			// Update the user profile picture in the database
			db.query(
				"UPDATE users SET profilePic = ? WHERE id = ?",
				[profilePicPath, userId],
				(err) => {
					if (err) {
						console.error(err);
						return res.status(500).send("Server error"); // Return server error if query fails
					}

					// Update the user profile picture in session data
					req.session.user.profilePic = profilePicPath;
					res.redirect("/"); // Redirect to home or profile page
				}
			);
		} catch (error) {
			console.error(error);
			res.status(500).send("Server error"); // Return generic server error
		}
	}
);

module.exports = router;
