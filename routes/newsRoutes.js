const express = require("express");
const router = express.Router();
const db = require("../database");

router.get("/", (req, res) => {
	const user = req.session.user || null;
	res.render("news", { user, isRegistered: !!req.session.user });
});

module.exports = router;
