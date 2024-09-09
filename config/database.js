const Sequelize = require("sequelize");

const sequelize = new Sequelize("hubwatch_database", "root", "Shad4321.", {
	dialect: "mysql",
	host: "localhost",
});

module.exports = sequelize;
