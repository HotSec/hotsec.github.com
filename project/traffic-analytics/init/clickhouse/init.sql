CREATE DATABASE IF NOT EXISTS traffic_analytics;

USE traffic_analytics;

CREATE TABLE IF NOT EXISTS page_views
(
    timestamp   DateTime,
    site_id     String,
    session_id  String,
    page_url    String,
    referrer    String,
    utm_source  String DEFAULT '',
    utm_medium  String DEFAULT '',
    utm_campaign String DEFAULT '',
    country     String DEFAULT '',
    city        String DEFAULT '',
    device_type String DEFAULT '',
    browser     String DEFAULT '',
    os          String DEFAULT '',
    duration_ms UInt32 DEFAULT 0
)
ENGINE = MergeTree()
ORDER BY (site_id, timestamp);
