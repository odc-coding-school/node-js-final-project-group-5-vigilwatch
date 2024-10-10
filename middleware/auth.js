function registeredUsers(req, res, next) {
	if (req.session && req.session.user) {
		// Checkign if user session exists
		return next();
	} else {
		res.redirect("http://localhost:5000/login");
	}
}

module.exports = registeredUsers;
