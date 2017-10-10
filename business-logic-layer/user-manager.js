const userValidator 	= require('./user-validator')
const userRepository 	= require('../data-access-layer/user-repository')
const patientManager  = require('./patient-manager');
const doctorManager   = require('./doctor-manager');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.create = function(user, callback){

	userRepository.getUserByEmail(user.email, function(user_exists,err2){
		if (user_exists != null){
			callback ('Email already exists', err2)
		}
		else{
			textPassword = user.password;
			bcrypt.hash(textPassword, saltRounds, function(err, hash) {

				userRepository.addUser(user, hash, function(idCreated, status, err){
			    if(err.length == 0){
			      console.log('Id Creado: ' + idCreated );
			      //CREATE PATIENT
			      if(user.role == 'patient'){
			        patientManager.create(user, idCreated, (status, err) => {
			          if(err.length == 0){
			            console.log('Patient Created');
			            callback(status, err)
			          }
			        });
			      //CREATE DOCTOR
			      }else if(user.role == 'doctor'){
			        doctorManager.create(user, idCreated, (status, err) => {
			          if(err.length == 0){
			            console.log('Doctor Created');
			            callback(status, err)
			          }
			        });
			      }
			  	}else{
			  		res.status(400).json(err)
			  	}

				 });
			 });

		 }

	})
}

exports.findOneGoogleUser = function(user, callback){
  userRepository.findOneGoogleUser(user, callback);
}

exports.createGoogleUser = function(user, callback){
  userRepository.addGoogleUser(user, callback);
}


exports.role = function(id, callback){
	//console.log('entro a la funcion')
	userRepository.getUserRole(id, callback);
	//callback(null,errors);
}

exports.jwtoken = function(email, callback){
	userRepository.getPwd(email, callback);
}

exports.update = function(email, pwd, callback){
	userRepository.updatePwd(email, pwd, callback);
}

exports.delete = function(id, callback){
	userRepository.deleteUser(id, callback);
}

exports.createtest = function(user, callback){
	myPlaintextPassword = user.password;
	const saltRounds = 10;
	bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  console.log(hash);// Store hash in your password DB.
	});

	bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
    // res == true
		console.log(res);
	});
}

// exports.allPatients = function(id, callback){
// 	//console.log('entro a la funcion')
// 	userRepository.getAllPatients(callback);
// 	//callback(null,errors);
// }
