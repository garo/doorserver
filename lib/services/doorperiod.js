var doorserver = require('../doorserver');

/**
 * Doorperiod provides a service which will perodically check all attached doors
 * if they should be open or not based on a Timeperiod which might be attached
 * to the door. This can be used to for example keep front door open on business hours.
 */

/**
 * Starts a timer that checks if any of the doors should be opened or not.
 * @param cb
 */
exports.init = function (cb) {
  console.log("Closing all doors for starters");
  var doors = Object.keys(doorserver.settings.get("doors"));

  (function next(i) {
    if (i < 0) {
      if (cb) {
        end();
      }
      return;
    }

    var door_id = Number(doors[i]);

    doorserver.services.door.closeDoor(door_id, function(err) {
      if (err) {
        console.error("Error closing door", door_id);
        cb(err);
        return;
      }

      next(i - 1);
    });
  
  })(doors.length - 1);

  function end() {
    setInterval(exports.checkAllDoorsTimer, 60 * 1000);
    exports.checkAllDoorsTimer();
    cb();
  }
};

exports.checkAllDoorsTimer = function () {
  var ts = new Date();
  exports.checkAllDoors(ts, function (err) {
    if (err) {
      console.error("Error on checkAllDoors", err);
    }
  });
};

/**
 * Iterates thru all doors defined in settings.door. queries the door
 * data from mysql and evaluates the possibly attached Timeperiod.
 *
 * If the provided timestamp falls into the Timeperiod
 * (as in timeperiod.evaluate(ts) returns true) then this function will
 * open or close the door by calling doorserver.services.door.closeDoor (or .openDoor())
 * methods.
 *
 * @param ts Date
 * @param cb
 */
exports.checkAllDoors = function (ts, cb) {

  var doors = Object.keys(doorserver.settings.get("doors"));

  (function next(i) {
    if (i < 0) {
      if (cb) {
        cb();
      }
      return;
    }


    var door_id = Number(doors[i]);

    exports.checkSingleDoor(ts, door_id, function (err) {
      if (err) {
        cb(err);
        return;
      }

      next(i - 1);
    });

  })(doors.length - 1);

};

/**
 * Uses shouldDoorBeOpen() to check if the door should be open or not and
 * then opens/closes the door according to that by calling
 * doorserver.services.door.closeDoor (or .openDoor()) methods.
 *
 * @param ts Date
 * @param door_id Number
 * @param cb
 */
exports.checkSingleDoor = function (ts, door_id, cb) {

  exports.shouldDoorBeOpen(ts, door_id, function (err, shouldBeOpen, because_of_rule) {

    if (shouldBeOpen === true) {
      if (!doorserver.services.door.isDoorOpen(door_id)) {
        console.log((new Date().toISOString()) + " Opening door", door_id, "because of periodic rule", JSON.stringify(because_of_rule));
      }
      doorserver.services.door.openDoor(door_id, function (err) {

        cb(err);
      });
    } else {
      if (doorserver.services.door.isDoorOpen(door_id)) {
        console.log((new Date().toISOString()) + " Closing door", door_id, "because of periodic rule", JSON.stringify(because_of_rule));
      }

      doorserver.services.door.closeDoor(door_id, function (err) {

        cb(err);
      });

    }
  });
};

/**
 * Evaluates if a door should be open or not by its timeperiod.
 *
 * If the provided timestamp falls into the Timeperiod
 * (as in timeperiod.evaluate(ts) returns true) then this function
 * will return true as the second callback parameter, otherwise returns false
 * in the callback.
 *
 * If the door doesn't have a timeperiod attached then this will return
 * false in the callback.
 *
 * @param ts Date
 * @param door_id Number
 * @param cb (err, shouldDoorBeOpen as boolean, because_of_rule as Object)
 */
exports.shouldDoorBeOpen = function (ts, door_id, cb) {

  doorserver.repositories.doorRepository.findDoorById(door_id, function (err, door) {
    if (err) {
      cb(err);
      return;
    }

    if (door === null) {
      console.error((new Date().toISOString()) + " Could not find door", door_id, "from database but it was in settings!");
      cb(null, false);
      return;
    }

    if (!door.timeperiod_id) {
      cb(null, false);
      return;
    }

    doorserver.services.timeperiod.evaluateTimeperiod(ts, door.timeperiod_id, function (err, shouldBeOpen, because_of_rule) {
      if (err) {
        cb(err);
        return;
      }

      cb(null, shouldBeOpen, because_of_rule);
    });

  });
};
