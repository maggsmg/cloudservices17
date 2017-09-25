var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cloudservices"
});
con.connect(function(err) {
  if (err) throw err;
});

exports.addDoctor = function(userCreate, idCreated, callback){
	const errors = [];
    var query_string = "INSERT INTO doctors (user_id, hospital, specialty) VALUES (" + "'" + idCreated + "','" + userCreate.hospital + "','" + userCreate.specialty + "');"
    console.log(query_string);
    con.query(query_string, function (err, result, fields) {
	    if (err) throw err;
      inserted_id = result.insertId;
	    console.log(result);
      console.log(inserted_id);

      callback('Doctor Created', errors);
	  });
}


exports.getPatient = function(id, callback){
  const errors = [];

	//con.connect(function(err) {
		//if (err) throw err;
		con.query("SELECT name, email FROM users WHERE (id =" + id +")", function (err, result, fields) {
    		if (err) throw err;
    		console.log(result);
    		callback(result,errors);
		});
	//});
}

// exports.getAll = function(callback){
// 	const query = `SELECT id, username, password FROM accounts ORDER BY id`
// 	db.getMany(query, {}, callback)
// }
