
var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
// const bodyParser = require('body-parser');
const typeCheck = require('type-check').typeCheck;
const userManager = require('../business-logic-layer/user-manager');
const patientManager = require('../business-logic-layer/patient-manager');
const doctorManager = require('../business-logic-layer/doctor-manager');

var app = express();
var server = http.createServer(app);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //

app.get('/', function (req, res) {
   console.log("Home");
   res.send('Welcome!');
})


//____CREATE NEW USER________
app.post('/user/create', function (req,res) {
  const userCreate = req.body;
  var role = userCreate.role;
  var expectedStructure = '';

  // IF PATIENT
  if(role === 'patient'){
	  expectedStructure = '{role:String, name: String, email: String, password: String, gender: String, age: String, height: String, weight:String }';
	}
  // IF DOCTOR
  else if (role === 'doctor'){
	  expectedStructure = '{role:String, name: String, email: String, password: String, hospital: String, specialty: String}';
  }
  else{
		res.status(400).json(["invalidRole"])
		return
  }

  if(!typeCheck(expectedStructure, userCreate)){
  		res.status(400).json(["invalidInput"])
  		return
  }

  userManager.create(userCreate, function(idCreated,status, errors){
    if(errors.length == 0){
      console.log(idCreated + 'hola');
  		res.send(status);
      //CREATE PATIENT
      if(userCreate.role == 'patient'){
        patientManager.create(userCreate, idCreated, (status, errors) => {
          if(errors.length == 0){
            res.send(status); //Como hacer que esto tambien aparezca
          }
        });
      //CREATE DOCTOR
      }else if(userCreate.role == 'doctor'){
        doctorManager.create(userCreate, idCreated, (status, errors) => {
          if(errors.length == 0){
            console.log('Doctor Created');
            res.send(status); //Como hacer que esto tambien aparezca
          }
        });
      }
  	}else{
  		res.status(400).json(errors)
  	}
	})

  //res.send();


});

app.get('/user/info/:id', function (req, res) {
	var id = req.params.id;

	//var user_info = getUserInfo(id);

  userManager.retrieve(id, function(userInfo, errors){
    if(errors.length == 0){
      res.send(userInfo) //no se si aqui deba ir res.json o res.send
    }else{
      res.status(400).json(errors)
    }
  })
  console.log('sopas');
  //res.send();

  // console.log(user_info);
  // res.send(user_info);

});

app.post('/user/newRegister', function (req,res) {
  const registerCreate = req.body;
  console.log(registerCreate);

});


app.listen(8000 , () => {
  console.log('Server listening on port 8000');
})
