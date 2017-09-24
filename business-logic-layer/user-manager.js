const userValidator = require('./user-validator')
const userRepository = require('../data-access-layer/user-repository')

exports.create = function(user, callback){
	
	userValidator.validate(user, function(user, errors){
		if(errors.length == 0){
			
			if(user.role === 'patient'){
				userRepository.addPatient(user, callback);
			}
			else{
				userRepository.addDoctor(user,callback);
			}
		}else{
			callback(null, errors)
		}
	})
	
}

exports.retrieve = function(id, callback){
	console.log('entro a la funcion')
	
	userRepository.getPatient(id, callback);
	callback(null,null);
}
