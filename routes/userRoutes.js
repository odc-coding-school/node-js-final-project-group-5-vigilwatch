const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../database.js");
const router = express.Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadFolder = "public/uploads";
		if (!fs.existsSync(uploadFolder)) {
			fs.mkdirSync(uploadFolder, { recursive: true });
		}
		cb(null, uploadFolder);
	},
	filename: function (req, file, cb) {
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
			return cb(null, true);
		} else {
			cb("Error: Images Only!");
		}
	},
});

//  Ensuring user is authenticated
const ensureAuthenticated = (req, res, next) => {
	if (req.session.user) {
		return next();
	}
	res.redirect("http://localhost:5000/login");
};

// Route for uploading profile image user profile
router.post(
	"/upload-profile",
	ensureAuthenticated,
	upload.single("profilePic"),
	async (req, res) => {
		try {
			const userId = req.session.user.id;

			if (!req.file) {
				return res.status(400).send("No file uploaded or invalid file type.");
			}

			const profilePicPath = req.file`/uploads/${req.file.filename}`;

			// updating the user profile picture in our database
			db.query(
				"UPDATE users SET profilePic = ? WHERE id = ?",
				[profilePicPath, userId],
				(err) => {
					if (err) {
						console.error(err);
						return res.status(500).send("Server error");
					}
					// updating the user profile picture in our session
					req.session.user.profilePic = profilePicPath;
					res.redirect("http://localhost:5000/");
				}
			);
		} catch (error) {
			console.error(error);
			res.status(500).send("Server error");
		}
	}
);

module.exports = router;
