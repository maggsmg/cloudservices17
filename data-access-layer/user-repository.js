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

exports.addUser = function(user, callback){
	const errors = [];
  var inserted_id;

  var query_string = "INSERT INTO users (role, name, email, password) VALUES (" + "'" + user.role + "','" + user.name + "','" + user.email + "','" + user.password + "');"
  console.log(query_string);
  con.query(query_string, function (err, result, fields) {
	   if (err) throw err;
     inserted_id = result.insertId;
	   console.log(result); //Dejarlo o no dejarlo esta es la cuestion
     callback (result.insertId,'User created', errors);
	  });
}


exports.getUserRole = function(id, callback){
  const errors = [];

	//con.connect(function(err) {
		//if (err) throw err;
		con.query("SELECT role FROM users WHERE id =" + id, function (err, result, fields) {
    		if (err) throw err;
    		console.log(result);
    		callback(result,errors);
		});
	//});
}

exports.getPwd = function(email, callback){
  const errors = [];

	//con.connect(function(err) {
		//if (err) throw err;
		con.query("SELECT password FROM users WHERE email =" + "'" + email + "'", function (err, result, fields) {
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
