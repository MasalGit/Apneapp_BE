CREATE DATABASE IF NOT EXISTS apneapp;
USE apneapp;

CREATE TABLE Users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50) NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE HrvResults (
  hrv_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  measured_at  DATETIME NOT NULL,
  mean_rr_ms   FLOAT,
  rmssd_ms     FLOAT,
  sdnn_ms      FLOAT,
  pns_index    FLOAT,
  sns_index    FLOAT,
  stress_index FLOAT,
  readiness    FLOAT,
  lf_hf_ratio  FLOAT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Measurements (
  measure_id  VARCHAR(100) PRIMARY KEY,
  user_id     INT NOT NULL,
  measured_at DATETIME NOT NULL,
  duration_s  FLOAT,
  lfhf_avg    FLOAT,
  risk        VARCHAR(20),
  timeseries  JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  INDEX idx_user_measured (user_id, measured_at)
);