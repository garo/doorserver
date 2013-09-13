
--
-- Test database for the Doorserver project. Contains dummy test data
--
--
-- Node that the software is designed so that you can add additional
-- columns to the tables and the program will just ignore them.
--
-- The main database is used only for reads, thus allowing mysql
-- replication to be used. All writes (audit logs etc)
-- are done to a separated database.
--
-- Data model explained as set of rules:
--  1) System has users
--  1.1) User can be disabled (set enabled = 0)
--  1.2) User has one-to-many keys
--  1.3) User has one-to-many groups
--
--  2) System has keys (tokens)
--  2.1) Token can be disabled (set enabled = 0)
--
--  3) User belongs to one-to-many groups
--  3.1) Group can be disabled (set enabled = 0)
--  3.2) Group has one-to-many doors which the group can open
--
--  4) System has Doors
--
drop database doorserver_test;
create database doorserver_test;
use doorserver_test;



create table doorserver_users (
       id int(11) not null primary key,
       name varchar(100),
       enabled int(1) default 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into doorserver_users values(100, 'User owning token named "mytoken"', 1);
insert into doorserver_users values(101, 'Disabled user with token \"disabled_token\"', 0);
insert into doorserver_users values(102, 'Juho Mäkinen', 1);

CREATE TABLE `doorserver_keys` (
  token varchar(16) not null primary key,
  uid int(11) NOT NULL,
  enabled int(1) default 1,
  CONSTRAINT FOREIGN KEY (uid) REFERENCES doorserver_users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create unique index doorserver_keys_token on doorserver_keys (token);

insert into doorserver_keys values('mytoken', 100, 1);
insert into doorserver_keys values('anothertoken', 101, 0);
insert into doorserver_keys values('disabled_token', 100, 0);
insert into doorserver_keys values('0005123997', 102, 1);


CREATE TABLE `doorserver_groups` (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name varchar(50) DEFAULT NULL,
  enabled int(1) default 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into doorserver_groups values(10, 'Workers', 1);
insert into doorserver_groups values(11, 'Clients', 1);

CREATE TABLE doorserver_user_to_group (
  id int(11) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  groupid int(11) NOT NULL,
  uid int(11) NOT NULL,
  CONSTRAINT FOREIGN KEY (groupid) REFERENCES doorserver_groups (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FOREIGN KEY (uid) REFERENCES doorserver_users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into doorserver_user_to_group values(1, 10, 100);
insert into doorserver_user_to_group values(2, 10, 102);

CREATE TABLE doorserver_doors (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  doorname varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into doorserver_doors values(1000, 'Etuovi');

CREATE TABLE doorserver_door_to_group (
  id int(11) AUTO_INCREMENT PRIMARY KEY,
  doorid int(11) NOT NULL,
  groupid int(11) NOT NULL,
  CONSTRAINT FOREIGN KEY (doorid) REFERENCES doorserver_doors (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FOREIGN KEY (groupid) REFERENCES doorserver_groups (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE UNIQUE INDEX doorserver_door_to_group_unique ON doorserver_door_to_group (groupid, doorid);

INSERT INTO doorserver_door_to_group VALUES(1, 1000, 10);

CREATE TABLE doorserver_timeperiods (
  id int(11) AUTO_INCREMENT PRIMARY KEY,
  name varchar(100) NOT NULL
);

INSERT INTO doorserver_timeperiods VALUES(10000, "Business hours");

CREATE TABLE doorserver_timeperiod_rules (
  id int(11) AUTO_INCREMENT PRIMARY KEY,
  timeperiod_id int(11),
  rule varchar(50) NOT NULL,
  exclude int(1) default 0,
  CONSTRAINT FOREIGN KEY (timeperiod_id) REFERENCES doorserver_timeperiods (id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO doorserver_timeperiod_rules VALUES(1, 10000, "1-5,08:00-18:00", 0);
INSERT INTO doorserver_timeperiod_rules VALUES(2, 10000, "6-7,10:00-18:00", 0);
INSERT INTO doorserver_timeperiod_rules VALUES(3, 10000, "24.12.", 1);

