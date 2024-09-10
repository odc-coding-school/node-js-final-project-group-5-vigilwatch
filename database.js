const mysql2 = require('mysql2');


const db = mysql2.createConnection({
    host: "localhost",
    user: "project",
    password: "12345",
    database: "hubwatch"
})


db.connect(function(err){
    if(err) return console.log(err.message);
    db.query("CREATE DATABASE IF NOT EXISTS hubwatch", function(err) {
        if(err) return console.log(err.message);
        return console.log('database is created successfully');
    })
     console.log('database connected');

    let query = 'SHOW DATABASES';

    db.query(query, (err, result)=>{
        if(err) return console.log(err.message);
        console.log(result);
        
    })

})







module.exports = db;
