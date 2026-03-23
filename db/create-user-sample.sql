CREATE USER 'healthdiary'@'localhost' IDENTIFIED BY 'salakala';
GRANT ALL PRIVILEGES ON `HealthDiary`.* TO 'healthdiary'@'localhost';
FLUSH PRIVILEGES;
