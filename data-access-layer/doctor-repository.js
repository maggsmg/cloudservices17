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

exports.addRegister = function(register, patientId, doctorId, callback){
  const errors =[];

  var query_string = "INSERT INTO doctorRegister (patient_id, doctor_id, weight_control, prescription) VALUES (" + "'" + patientId + "','" + doctorId + "','" + register.weight_control + "','" + register.prescription + "');"
  //console.log(query_string);
  con.query(query_string, function (err, result, fields) {
    if (err) throw err;
    callback('Register Created', errors);
  });

}

exports.getDoctor = function(id, callback){
  const errors = [];

	//con.connect(function(err) {
		//if (err) throw err;
		con.query("SELECT * FROM users INNER JOIN doctors ON users.id = doctors.user_id WHERE user_id =" + id, function (err, result, fields) {
    		if (err) throw err;
    		console.log(result);
    		callback(result,errors);
		});
	//});
}

exports.getAllDoctors = function(callback){
  const errors = [];
  var query_string = "SELECT * FROM users INNER JOIN doctors ON users.id = doctors.user_id"
  console.log(query_string);
  con.query(query_string, function (err, result, fields) {
      if (err) throw err;
      callback(result,errors);
  });

}
