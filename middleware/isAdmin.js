function isAdmin(req, res, next) {
	if (req.session.user && req.session.user.role === 1) {
		next();
	} else {
		res.status(403).send(" You do not have permission to access this page.");
	}
}

module.exports = isAdmin;
