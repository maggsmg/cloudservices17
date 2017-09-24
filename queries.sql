SELECT *
FROM users
WHERE id = 1;

INSERT INTO users (role, name, email, password)
VALUES ('patient', 'Miguel', 'migmira@email.com', 'mimorra2');
SELECT LAST_INSERT_ID();

INSERT INTO users role, name, email, password VALUES ('patient','Maggs','magdalenamtzg@gmail.com', 'user.password');
