CREATE DATABASE IF NOT EXISTS metaspacewars;
USE metaspacewars;

CREATE TABLE IF NOT EXISTS player (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pubkey VARCHAR(50) NOT NULL,
    highscore INT NOT NULL,
    metadata TEXT
);