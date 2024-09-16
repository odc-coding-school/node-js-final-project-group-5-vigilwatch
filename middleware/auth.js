function registeredUsers(req, res, next) {
	if (req.session && req.session.user) {
		// Checkign if user session exists
		return next();
	} else {
		res.redirect("/login");
	}
}

module.exports = registeredUsers;
