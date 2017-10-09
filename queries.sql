-- CREAR DATABASE

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `google_id` varchar(30) NULL UNIQUE,
  `role` varchar(10) NOT NULL DEFAULT '',
  `name` varchar(30) NOT NULL DEFAULT '',
  `email` varchar(40) NOT NULL UNIQUE DEFAULT '',
  `password` varchar(30) NOT NULL DEFAULT '',
  `profile_pic` varchar(50) DEFAULT NULL,
  `token` varchar(300) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `patients` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` char(11) NOT NULL DEFAULT '',
  `weight` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `patientRegister` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT NULL,
  `patient_id` int(11) NOT NULL,
  `sugar_level` int(11) NOT NULL,
  `blood_pressure` text NOT NULL,
  `insulin_intake` int(11) DEFAULT NULL,
  `foot_pic` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `doctors` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `hospital` varchar(11) NOT NULL DEFAULT '',
  `specialty` varchar(11) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `doctorRegister` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `weight_control` int(11) NOT NULL,
  `prescription` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;


SELECT *
FROM users
WHERE id = 1;

INSERT INTO users (role, name, email, password)
VALUES ('patient', 'Miguel', 'migmira@email.com', 'mimorra2');
SELECT LAST_INSERT_ID();

INSERT INTO users role, name, email, password VALUES ('patient','Maggs','magdalenamtzg@gmail.com', 'user.password');


SELECT *
FROM users
INNER JOIN patients ON users.id = patients.user_id
WHERE users.id = 50

INSERT INTO patientRegister (patient_id, sugar_level, blood_pressure, insulin_intake, foot_pic)
VALUES ('3', '85', '120/80', '0', NULL)

INSERT INTO patientRegister (patient_id, sugar_level, blood_pressure, insulin_intake, foot_pic) VALUES ('3', '85', '120/80', '0', NULL)

SELECT *
FROM patientRegister
WHERE patientRegister.patient_id = 43

SELECT *
FROM doctorRegister
WHERE patient_id = 15 AND doctor_id = 3

