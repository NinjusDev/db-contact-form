CREATE DATABASE IF NOT EXISTS goeventos;

USE goeventos;

CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(50),
    contactnumber VARCHAR(20) NOT NULL,
    message TEXT
);

SELECT * FROM messages;