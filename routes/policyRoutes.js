const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	const user = req.session.user || null;
	res.render("policy", { user });
});

module.exports = router;
