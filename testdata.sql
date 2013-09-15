--
-- test data for unit tests.
--
-- Many unit tests assume that the database contains this and only this data
--
--
--


-- id, name, enabled
insert into doorserver_users values(100, 'User owning token named "mytoken"', 1);
insert into doorserver_users values(101, 'Disabled user with token \"disabled_token\"', 0);
insert into doorserver_users values(102, 'Juho Mäkinen', 1);

-- token, user_id, enabled
insert into doorserver_keys values('mytoken', 100, 1);
insert into doorserver_keys values('anothertoken', 101, 0);
insert into doorserver_keys values('disabled_token', 100, 0);
insert into doorserver_keys values('0005123997', 102, 1);

-- group id, name, enabled
insert into doorserver_groups values(10, 'Workers', 1);
insert into doorserver_groups values(11, 'Clients', 1);

-- id, group_id, user_id
insert into doorserver_user_to_group values(1, 10, 100);
insert into doorserver_user_to_group values(2, 10, 102);

-- door id, name, timeperiod_id
insert into doorserver_doors values(1000, 'Etuovi', 10000);

-- id, door id, group id
INSERT INTO doorserver_door_to_group VALUES(1, 1000, 10);

-- id, name
INSERT INTO doorserver_timeperiods VALUES(10000, "Business hours");

-- id, timeperiod_id, rule, exclude
INSERT INTO doorserver_timeperiod_rules VALUES(1, 10000, "1-5,08:00-18:00", 0);
INSERT INTO doorserver_timeperiod_rules VALUES(2, 10000, "6-7,10:00-18:00", 0);
INSERT INTO doorserver_timeperiod_rules VALUES(3, 10000, "24.12.", 1);

