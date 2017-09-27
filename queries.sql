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

INSERT INTO patientRegister (patient_id, sugar_level, blood_pressure, insulin_intake, foot_pic) VALUES ('3', registerCreate.sugar_level, '120/80', '0', NULL)
