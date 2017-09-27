const userValidator = require('./user-validator')
const doctorRepository = require('../data-access-layer/doctor-repository')

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

	doctorRepository.addRegister(register, patientId, doctorId, callback);
}

exports.allInfo = function(id, callback){
	//console.log('entro a la funcion')
	doctorRepository.getDoctor(id, callback);
	//callback(null,errors);
}

exports.allDoctors= function(callback){

	doctorRepository.getAllDoctors(callback);
}
