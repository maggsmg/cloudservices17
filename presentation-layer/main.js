
var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('../config');
// const bodyParser = require('body-parser');

const typeCheck = require('type-check').typeCheck;
const userManager = require('../business-logic-layer/user-manager');
const patientManager = require('../business-logic-layer/patient-manager');
const doctorManager = require('../business-logic-layer/doctor-manager');

var app = express();
var server = http.createServer(app);

var port = process.env.PORT || 8000; // used to create, sign, and verify tokens
app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //

app.use((req, res, next) => {
  var now = new Date().toString();
  var url = req.url;
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);

  if (url != '/authenticate' ){

    //fs.appendFile('server.log', log + '\n');
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({
          success: false,
          message: 'No token provided.'
      });

    }

  }else{
    //Pages Not Required
    next();
  }

});


app.get('/', function (req, res) {
   console.log("Home");
   res.send('Welcome!');
})

//__________POSTS___________
app.post('/authenticate', function(req, res) {

  //var token = jwt.sign("user", app.get('superSecret'), {
    //expiresIn: 1440 // expires in 24 hours
  //});

  var login = req.body;

  userManager.jwtoken(login.email, function(result, errors){
    if(errors.length == 0){
      //console.log('yallegue');
      //res.send(result) //no se si aqui deba ir res.json o res.send
      if (result.length != 1) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      }else if (result){
            // check if password matches
            console.log(result[0].password);
            console.log(req.body.password);
        if (result[0].password != req.body.password) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        }else{
          console.log('Mi novio me habla feo y me enoja y el también por que yo me enojo');
          // if user is found and password is right
          // create a token
          var token = jwt.sign({
            email: login.email,
            password: result[0].password
          }, app.get('superSecret'), { expiresIn: 60 * 60 });

          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }
      }
    }else{
      res.status(400).json(errors)
    }
  });

});

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
            var token = jwt.sign(userCreate, app.get('superSecret'), {
              expiresIn: 1440 // expires in 24 hours
            });
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token
            });
            //res.send(status); //Como hacer que esto tambien aparezca
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

app.get('/patientRegisters/:id', (req, res) =>{
  var patientId = req.params.id;
  patientManager.onePatient(patientId, (allRegisters, errors) =>{
    console.log(allRegisters);
    res.send('SUCCESS');
  });
});

app.get('/doctorRegister/:patientId/:doctorId', (req, res) =>{
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;

  doctorManager.oneDoctorPatient(patientId, doctorId, (allRegisters, errors) =>{
    console.log(allRegisters);
    res.send('SUCCESS');
  })
})


app.listen(8000 , () => {
  console.log('Server listening on port 8000');
})
