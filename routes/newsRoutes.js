const express = require("express");
const router = express.Router();
const db = require("../database.js");
const multer = require("multer");
const path = require("path");
const isAdmin = require("../middleware/isAdmin");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

// Admin route to handle news import onlu admin can import news
router.post(
	"/admin/news/import",
	isAdmin,
	upload.single("image"),
	async (req, res) => {
		const { title, content, created_at, location } = req.body;
		const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

		console.log("Image uploaded to:", imagePath);

		try {
			await db
				.promise()
				.query(
					"INSERT INTO news (title, image, content, created_at, location) VALUES (?, ?, ?, ?, ?)",
					[title, imagePath, content, created_at, location]
				);
			res.redirect("/news");
		} catch (error) {
			console.error(error);
			res.status(500).send("Server Error");
		}
	}
);

module.exports = router;
