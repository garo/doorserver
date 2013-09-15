
--
-- Test database for the Doorserver project.
--
-- This schema contains only the logs. Check doorserver_data.sql
-- for other data.
--

CREATE TABLE doorserver_logs (
  id int(11) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ts timestamp,
  token varchar(50),
  user_id int(11) DEFAULT NULL,
  door_id int(11) DEFAULT NULL,
  event varchar(10) NOT NULL,
  reason varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

