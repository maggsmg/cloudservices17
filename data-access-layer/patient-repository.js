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

exports.addPatient = function(userCreate, idCreated, callback){
	// db.insert('accounts', ['username', 'password'], account, callback)
	const errors = [];
  //console.log(user);
  var inserted_id;
	//con.connect(function(err) {
	  //if (err) throw err;
    var query_string = "INSERT INTO patients (user_id, gender, age, weight, height) VALUES (" + "'" + idCreated + "','" + userCreate.gender + "','" + userCreate.age + "','" + userCreate.weight + "','" + userCreate.height + "');"
    console.log(query_string);
    con.query(query_string, function (err, result, fields) {
	    if (err) throw err;
      inserted_id = result.insertId;
	    console.log(result);
      console.log(inserted_id);

      callback('Patient Created', errors);
	  });



	 //callback('SUCCESS', errors);
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
