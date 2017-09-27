
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

//__________POSTS___________

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

app.post('/user/newPatientRegister/:id', function (req,res) {
  var patientId = req.params.id;
  const register = req.body;

  patientManager.createRegister(register, patientId, (status, errors) =>{
    if(errors.length == 0){
      console.log('Patient Register Created');
      res.send(status); //Como hacer que esto tambien aparezca
    }

  });


});

app.post('/user/newPatientRegister/:id', function (req,res) {
  var patientId = req.params.id;
  const register = req.body;

  patientManager.createRegister(register, patientId, (status, errors) =>{
    if(errors.length == 0){
      console.log('Patient Register Created');
      res.send(status); //Como hacer que esto tambien aparezca
    }

  });


});

app.post('/user/newDoctorRegister/:patientId/:doctorId', function (req,res) {
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;
  const register = req.body;

  doctorManager.createRegister(register, patientId, doctorId, (status, errors) =>{
    if(errors.length == 0){
      console.log('Doctor Register Created for patient:' + patientId);
      res.send(status); //Como hacer que esto tambien aparezca
    }

  });


});

//__________GETS___________
app.get('/user/:id', function (req, res) {
	var id = req.params.id;

  userManager.role(id, function(userInfo, errors){
    if(errors.length == 0){
      //console.log('yallegue');
      var role = userInfo[0].role;
      //console.log(role);
      if(role == 'patient'){
        patientManager.allInfo(id, (patientInfo, errors) =>{
          //console.log(patientInfo);
        });
      }
      else if(role == 'doctor'){
        doctorManager.allInfo(id, (doctorInfo, errors) =>{
          //console.log(doctorInfo);
        });
      }
      res.send(userInfo) //no se si aqui deba ir res.json o res.send
    }else{
      res.status(400).json(errors)
    }
  });

});

app.get('/patients' , (req, res)=>{
  //tengo que meter un validator aqui o un typeCheck?

  patientManager.allPatients( (allPatients, errors) =>{
    //console.log(typeof allPatients); Para saber que tipo de dato es
    console.log(allPatients); //Lo debo dejar aqui?
  })

});

app.get('/doctors' , (req, res)=>{
  //tengo que meter un validator aqui o un typeCheck?

  doctorManager.allDoctors( (allDoctors, errors) =>{
    //console.log(typeof allPatients); Para saber que tipo de dato es
    console.log(allDoctors); //Lo debo dejar aqui?
  })

});


app.listen(8000 , () => {
  console.log('Server listening on port 8000');
})
