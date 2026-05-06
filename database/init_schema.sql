CREATE DATABASE IF NOT EXISTS network_monitor;
USE network_monitor;

CREATE TABLE IF NOT EXISTS network_metrics (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    download_mbps FLOAT NULL,
    upload_mbps FLOAT NULL,
    latency_ms FLOAT NULL,
    jitter_ms FLOAT NULL,
    server_name VARCHAR(100) NULL,
    server_location VARCHAR(100) NULL,
    isp_name VARCHAR(100) NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS app_traffic_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    bytes_sent FLOAT DEFAULT 0,
    bytes_recv FLOAT DEFAULT 0,
    connection_count INT DEFAULT 0
);
