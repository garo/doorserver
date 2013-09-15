doorserver
==========

Doorserver for Raspberry Pi with RFID support. Allows you to define users with rfid tokens, attach users to groups and attach physical doors to the groups. Then the user can show his RFID token to gain access to a physical door protected by an electrical lock.

Features
--------

 - Reads users, user groups, user authentication keys/tokens and doors from mysql database.
 - Supports time periods which can be attached into doors, so the system will keep your door open on your business hours.
 - Database schema is extendable with additional fields (the sever does not care if there are additional columns in the tables).
 - Supports USB attached RFID token readers (more drivers can be coded easily).
 - Supports PiFace attached electronic door locks and sound buzzers to indicate that the door is open.
 - Easily extendable for other hardware peripherals.
 - Supports multiple doors and rfid readers on a single Raspberry Pi.
 - Database can be shared between multiple Raspberry Pi instances (you could use mysql async replication).

Usage
-----

 1) run "npm install" to install npm packages
 2) "make test" to run all tests
 3) Edit settings.js
 4) Start the server with "node doorserver.js"

 The upstart/ directory has an upstart-ready script. You need to do "apt-get upgrade" and
 "apt-get install upstart" before you can copy the script under /etc/init


Read testdata.sql for data model documentation.

Time periods for automatic door open and close based on current time
--------------------------------------------------------------------

The current data model defines Time Periods. Each time period has a name and a set of
rules. Each door can have one time period attached to it. The doorserver then checks
every minute if the attached doors should be opened or closed based on current time.
This allows the operator to define rules, for example, based on business hours when
the doors are kept open.

Each rule in a Time Period is defined with a simple text format, which has the
following options:
 1) "1-7,00:00-23:59" where "1-7" means "from monday(1) to sunday(7)" (if your week starts on monday). If you week starts from sunday you should specify "0-6" which means from Sunday to Saturday. The "00:00-23:59" means the time.
 2) "4,00:00-23:59" means just a single day Thursday(4)
 3) "24.12." means the 24th day of December.
 4) "24.12.-25.12." means the days 24th and 25th of December.

So you could define these two rules:
 - "1-5,08:00-17:00" and
 - "6-7,09:00-16:00" which means that the door will be open from 08:00 to 17:00 from Monday to Friday and then from 09:00 to 16:00 from Saturday to Sunday.

Each rule can also be defined to be an excluding rule (a separated bit in the database table).
You could add excluding rule "24.12." to the previous example and the door would be closed on the x-mas eve.

So the rules are then evaluated in this order
 1) First iterate thru the inclusing rules and if one of these match, then the door will be open.
 2) Unless one of the excluding rules matches, then the door will be closed even if one of the including rules matched.


Known limitations
-----------------

 - Doesn't currently have any user interface. It only reads data from mysql database and it's up to the user to figure out how to add user, user groups, authentication tokens etc to the database.
 - Currently doesn't support any kind of authenticated/encrypted rfid tokens, so copying rfid tokens with appropriate hardware is possible.

Internal code structure
-----------------------

 - There's *services*, *repositories*, *models* and *drivers*.
 - The services take care of tasks like waiting for read tokens, or checking every minute if a door should be opened or closed based on a configured time period.
 - Repositories encapsulate all access to underlying database.
 - Drivers encapsulate all access to underlying physical hardware.

