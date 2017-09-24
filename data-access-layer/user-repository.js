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

exports.addPatient = function(user, callback){
	// db.insert('accounts', ['username', 'password'], account, callback)
	const errors = [];
  console.log(user);
	//con.connect(function(err) {
	  //if (err) throw err;
    var query_string = "INSERT INTO users (role, name, email, password) VALUES (" + "'" + user.role + "','" + user.name + "','" + user.email + "','" + user.password + "');"
    console.log(query_string);
    con.query(query_string, function (err, result, fields) {
	    if (err) throw err;
	    console.log(result);
			callback(result, errors);
	    console.log('Aqui entro');
	  //});
	});

	// console.log('Aqui entro');
	// callback('JALO', errors);
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
