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
	db.query(`CREATE DATABASE IF NOT EXISTS hubwatch_database`, function (err) {
		if (err) return console.log(err.message);
		return console.log("database is created successfully");
	});
	console.log("database connected");
});

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
			console.log("error creating users table");
		} else {
			console.log("Users table created or already exists");
		}
	});

	// Incident query
	const createIncidentsTable = `
        CREATE TABLE IF NOT EXISTS incidents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            incident_type VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            incident_date DATETIME NOT NULL,
            location VARCHAR(255) NOT NULL,
            image_path VARCHAR(255),
			userId INT,
            FOREIGN KEY (userId) REFERENCES users(id)
            location_lat DECIMAL(10, 8),
            location_lng DECIMAL(11, 8),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

	db.query(createIncidentsTable, (error, result) => {
		if (error) {
			console.log("error creating incidents table");
		} else {
			console.log("Incidents table created or already exists");
		}
	});

	// New query
	const createNewsTable = `
        CREATE TABLE IF NOT EXISTS news (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title TEXT NOT NULL,
            image VARCHAR(255) NOT NULL,
            content VARCHAR(255) NOT NULL,
            location VARCHAR(55) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

	db.query(createNewsTable, (error, result) => {
		if (error) {
			console.log(error);
		} else {
			console.log("News table created or already exists");
		}
	});

	// Message table query
	const message_table = `
        CREATE TABLE IF NOT EXISTS messages
        (message_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, room_id INT, 
        message_type VARCHAR(255), messaged_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (room_id) REFERENCES room(room_id))
    `;

	db.query(message_table, (error, result) => {
		if (error) {
			console.error("Error creating messages table: ", error);
		} else {
			console.log("Message table created or already exists");
		}
	});

	// Room table query
	const room_table = `
        CREATE TABLE IF NOT EXISTS room
        (room_id INT PRIMARY KEY AUTO_INCREMENT, address VARCHAR(255), createdAT TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    `;

	db.query(room_table, (error, result) => {
		if (error) {
			console.error("Error creating room table: ", error);
		} else {
			console.log("Room table created or already exists");
		}
	});

	// Location query
	db.query(
		`CREATE TABLE IF NOT EXISTS location (
        id INT AUTO_INCREMENT PRIMARY KEY, location VARCHAR(255))`,
		(err, result) => {
			console.log("Location Table created successfully");
		}
	);

	db.query(
		`INSERT INTO location (id, location) VALUES
        (DEFAULT, "Sinkor"), (DEFAULT, "West Point"), (DEFAULT, "New Kru Town"),
        (DEFAULT, "Congo Town"), (DEFAULT, "Paynesville"), (DEFAULT, "Clara Town"),
        (DEFAULT, "Mamba Point"), (DEFAULT, "Duala"), (DEFAULT, "Gardnersville"),
        (DEFAULT, "Bushrod Island"), (DEFAULT, "Logan Town"), (DEFAULT, "Vai Town"),
        (DEFAULT, "Lakpazee"), (DEFAULT, "Jallah Town"), (DEFAULT, "Old Road"),
        (DEFAULT, "Barnersville"), (DEFAULT, "Red Light"), (DEFAULT, "ELWA Junction"),
        (DEFAULT, "Jacob Town"), (DEFAULT, "Caldwell"), (DEFAULT, "Matadi Estate"),
        (DEFAULT, "Chocolate City"), (DEFAULT, "Stephen Tolbert Estate"),
        (DEFAULT, "Chugbor"), (DEFAULT, "Fiamah"), (DEFAULT, "Plunkor"),
        (DEFAULT, "Doe Community"), (DEFAULT, "Jamaica Road"), (DEFAULT, "Gbangay Town"),
        (DEFAULT, "Johnsonville")`,
		(err, result) => {
			if (err) return console.log(err.message);
			console.log("Insert into the location table successful");
		}
	);

	// Alter Table Queries to add 'status' and 'role' columns
	db.query(
		`ALTER TABLE incidents ADD COLUMN status VARCHAR(10) DEFAULT 'pending';`,
		(err, result) => {
			if (err) {
				console.log("Error altering incidents table:", err.message);
			} else {
				console.log("Added 'status' column to incidents table");
			}
		}
	);

	db.query(
		`ALTER TABLE incidents ADD COLUMN userId INT, ADD FOREIGN KEY (userId) REFERENCES users(id);`,
		(err, result) => {
			if (err) {
				console.log("Error altering incidents table:", err.message);
			} else {
				console.log("Added 'userId' column to incidents table");
			}
		}
	);

	db.query(`ALTER TABLE news DROP COLUMN link `, (err, result) => {
		if (err) {
			console.log("Error altering incidents table:", err.message);
		} else {
			console.log("link drop");
		}
	});

	db.query(
		`ALTER TABLE users ADD COLUMN role INT DEFAULT 0;`,
		(err, result) => {
			if (err) {
				console.log("Error altering users table:", err.message);
			} else {
				console.log("Added 'role' column to users table");
			}
		}
	);
};

createTables();

module.exports = db;
