-- Drop the database if it exists and then create it (root account needed)
DROP DATABASE IF EXISTS HealthDiary;
CREATE DATABASE HealthDiary;

USE HealthDiary;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_level VARCHAR(10) DEFAULT 'regular'
);

CREATE TABLE DiaryEntries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_date DATE NOT NULL,
    mood VARCHAR(50),
    weight DECIMAL(5,2),
    sleep_hours INT,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- taulu verenpaineen manuaalista merkitää varten 
CREATE TABLE BloodPressure (
    bp_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    systolic INT NOT NULL, -- Yläpaine
    diastolic INT NOT NULL, -- Alapaine
    pulse INT, -- Syke (valinnainen)
    measured_at DATETIME NOT NULL, -- mittaushetki
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- koska kirjattu kantaan
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Insert sample data

INSERT INTO Users (username, password, email, created_at, user_level) VALUES
('johndoe', 'hashed_password', 'johndoe@example.com', '2024-01-01 09:00:00', 'regular'),
('janedoe', 'hashed_password', 'janedoe@example.com', '2024-01-02 10:00:00', 'admin'),
('alice_jones', 'hashed_password', 'alice@example.com', '2024-01-04 08:30:00', 'regular'),
('bob_brown', 'hashed_password', 'bob@example.com', '2024-01-05 07:45:00', 'regular');

INSERT INTO DiaryEntries (user_id, entry_date, mood, weight, sleep_hours, notes, created_at) VALUES
(1, '2024-01-10', 'Happy', 70.5, 8, 'Had a great workout session', '2024-01-10 20:00:00'),
(2, '2024-01-11', 'Satisfied', 65.0, 7, 'Met with friends, had a good time', '2024-01-11 21:00:00'),
(3, '2024-01-12', 'Tired', 68.0, 6, 'Work was demanding', '2024-01-12 22:00:00'),
(4, '2024-01-13', 'Energetic', 55.0, 9, 'Went for a morning run', '2024-01-13 18:00:00'),
(4, '2024-01-14', 'Relaxed', 75.0, 8, 'Spent the day reading', '2024-01-14 19:00:00');

INSERT INTO BloodPressure (user_id, systolic, diastolic, pulse, measured_at, notes) VALUES
(1, 120, 80, 65, '2026-03-01 08:00:00', 'Aamumittaus, levännyt olo.'),
(1, 145, 95, 72, '2026-03-02 14:30:00', 'Stressaava työpäivä, kahvia juotu juuri ennen.'),
(1, 118, 78, 85, '2026-03-03 18:00:00', 'Lenkin jälkeen, syke vielä hieman koholla.'),
(1, 122, 82, 60, '2026-03-04 07:15:00', NULL), -- Testataan null-arvoa muistiinpanoissa
(1, 138, 88, 70, '2026-03-05 21:00:00', 'Iltamittaus ennen nukkumaanmenoa.');

