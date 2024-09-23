const mysql2 = require("mysql2");
require("dotenv").config();

const db = mysql2.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

db.connect(function (err) {
	if (err) return console.log(err.message);
	db.query(`CREATE DATABASE IF NOT EXISTS hubwatch_database `, function (err) {
		if (err) return console.log(err.message);
		return console.log("database is created successfully");
	});
	console.log("database connected");
});

// db.query(
// 	`CREATE TABLE IF NOT EXISTS location (
// 	id INT AUTO_INCREMENT PRIMARY KEY, location VARCHAR(255))`,
// 	(err, result) => {
// 		console.log("Location Table created successfully");
// 	}
// );

// db.query(
// 	`INSERT INTO location (id, location) VALUES(DEFAULT, "Sinkor"),(DEFAULT, "West Point"),
// 	(DEFAULT, "New Kru Town"), (DEFAULT, "Congo Town"), (DEFAULT, "Paynesville"), (DEFAULT, "Clara Town"),
// 	(DEFAULT, "Mamba Point"), (DEFAULT, "Duala"), (DEFAULT, "Gardnersville"),
// 	(DEFAULT, "Bushrod Island"), (DEFAULT, "Logan Town"), (DEFAULT, "Vai Town"), (DEFAULT, "Lakpazee"),
// 	(DEFAULT, "Jallah Town"), (DEFAULT, "Old Road"), (DEFAULT, "Barnersville"), (DEFAULT, "Red Light"), (DEFAULT, "ELWA Junction"),
// 	(DEFAULT, "Jacob Town"), (DEFAULT, "Caldwell"), (DEFAULT, "Matadi Estate"), (DEFAULT, "Chocolate City"), (DEFAULT, "Stephen tolber Estate"),
// 	(DEFAULT, "Chugbor"), (DEFAULT, "Fiamah"), (DEFAULT, "Plunkor"), (DEFAULT, "Doe Community"), (DEFAULT, "Jamaica Road"), (DEFAULT, "Gbangay Town"), (DEFAULT, "Johnsonville")

// 	`,
// 	(err, result) => {
// 		if (err) return console.log(err.message);

// 		console.log("Insert into the location table successful");
// 	}
// );

const createTables = () => {
	const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            user_address VARCHAR(255),
			room_id INT, 
			profilePic VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			FOREIGN KEY(room_id) REFERENCES room(room_id)
        )
    `;

	db.query(createUsersTable, (error, result) => {
		if (error) {
			console.log(" creating users table");
		} else {
			console.log("Users table created or already exists");
		}
	});

	const createIncidentsTable = `
		CREATE TABLE incidents (
			id INT AUTO_INCREMENT PRIMARY KEY,
			incident_type VARCHAR(50) NOT NULL,
			description TEXT NOT NULL,
			incident_date DATETIME NOT NULL,
			location VARCHAR(255) NOT NULL,
			image_path VARCHAR(255),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
`;

	const message_table = `
	CREATE TABLE IF NOT EXISTS messages
		(message_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, room_id INT, 
		message_type VARCHAR(255), messaged_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (room_id) REFERENCES room(room_id))
	`;

	db.query(createIncidentsTable, (error, result) => {
		if (error) {
			console.log(" creating incidents table");
		} else {
			console.log("Incidents table created or already exists");
		}
	});

	// run the queries
	// db.query(createUsersTable, (error, result) => {
	// 	if (error) {
	// 		console.error("Error creating users table: ", error);
	// 	} else {
	// 		console.log("Users table created or already exists");
	// 	}
	// });

	// run the message queries
	db.query(message_table, (error, result) => {
		if (error) {
			console.error("Error creating users table: ", error);
		} else {
			console.log("message table created or already exists");
		}
	});
};

createTables();

module.exports = db;
