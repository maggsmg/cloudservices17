const userValidator 	= require('./user-validator')
const userRepository 	= require('../data-access-layer/user-repository')
const patientManager  = require('./patient-manager');
const patientRepository = require('../data-access-layer/patient-repository')
const doctorManager   = require('./doctor-manager');
const doctorRepository = require('../data-access-layer/doctor-repository')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const http = require('http');

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

exports.findUserByEmail = function(user, callback){
	userRepository.findUserByEmail(user, callback);
}

exports.role = function(id, callback){
	userRepository.getUserRole(id, callback);
}

exports.updatePwd = function(email, pwd, callback){

	bcrypt.hash(pwd, saltRounds, function(err, hash) {
		userRepository.updatePwd(email, hash, callback);
	});
	//userRepository.updatePwd(email, pwd, callback);
}

exports.delete = function(id, callback){
	//userRepository.deleteUser(id, callback);
	userRepository.getUserById(id, function(user_exists,err2){
		if (user_exists == null){
			callback ('User does not exist', err2)
		}
		else{
			userRepository.deleteUser(id, callback);
			if(user_exists.role == 'patient'){
				patientRepository.delete(id, callback);
			}
			else{
				doctorRepository.delete(id,callback);
			}

		 }

	})
}

exports.verifyPwd = function(userPwd, inputPwd, callback){
		bcrypt.compare(inputPwd, userPwd, function(err, result) {
			// res == true
			//if (err) throw err;

			callback(err, result);
		});
}
