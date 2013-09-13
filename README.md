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

Usage
-----

 1) run "npm install" to install npm packages
 2) "make test" to run all tests
 3) Start the server with "node app.js"


Read testdata.sql for data model documentation.
