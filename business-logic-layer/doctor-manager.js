const userValidator = require('./user-validator')
const doctorRepository = require('../data-access-layer/doctor-repository')
const userRepository 	= require('../data-access-layer/user-repository')
const patientRepository = require('../data-access-layer/patient-repository')

exports.create = function(userCreate, idCreated, callback){

	userValidator.validate(userCreate, function(userCreates, errors){
		if(errors.length == 0){
				doctorRepository.addDoctor(userCreate, idCreated, callback);
		}else{
			callback(null, errors)
		}
	})

}

exports.createRegister = function (register, patientId, doctorId, callback) {

	patientRepository.getUserById(patientId, function(user_exists,err2){
		if (user_exists == null){
			callback ('Patient does not exist', err2)
		}
		else{
			doctorRepository.getUserById(doctorId, function(user_exists,err2){
				if (user_exists == null){
					callback ('Doctor does not exist', err2)
				}
				else{
					doctorRepository.addRegister(register, patientId, doctorId, callback);
				}
			});
		}

	})

	//doctorRepository.addRegister(register, patientId, doctorId, callback);
}

exports.allInfo = function(id, callback){
	//console.log('entro a la funcion')
	doctorRepository.getDoctor(id, callback);
	//callback(null,errors);
}

exports.allDoctors= function(callback){

	doctorRepository.getAllDoctors(callback);
}

exports.oneDoctorPatient = function(patientId, doctorId, callback){
	patientRepository.getUserById(patientId, function(user_exists,err2){
		if (user_exists == null){
			callback ('Patient does not exist', err2)
		}
		else{
			doctorRepository.getUserById(doctorId, function(user_exists,err2){
				if (user_exists == null){
					callback ('Doctor does not exist', err2)
				}
				else{
					doctorRepository.getThis(patientId, doctorId, callback);
				}
			});
		}

	})
	//doctorRepository.getThis(patientId, doctorId, callback);
}
