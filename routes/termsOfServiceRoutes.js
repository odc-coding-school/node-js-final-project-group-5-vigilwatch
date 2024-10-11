const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	const user = req.session.user || null;
	res.render("terms", { user });
});

module.exports = router;
