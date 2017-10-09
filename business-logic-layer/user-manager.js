const userValidator 	= require('./user-validator')
const userRepository 	= require('../data-access-layer/user-repository')
const patientManager  = require('./patient-manager');
const doctorManager   = require('./doctor-manager');

exports.create = function(user, callback){

	userRepository.getUserByEmail(user.email, function(user_exists,err2){
		if (user_exists != null){
			callback ('Email already exists', err2)
		}
		else{
			userRepository.addUser(user, function(idCreated, status, err){
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

// exports.allPatients = function(id, callback){
// 	//console.log('entro a la funcion')
// 	userRepository.getAllPatients(callback);
// 	//callback(null,errors);
// }
