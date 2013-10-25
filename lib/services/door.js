var doorserver = require('../doorserver');

exports.DOOR_CLOSED = 0;
exports.DOOR_OPEN = 1;

exports.doorHoldState = {};
exports.doorTemporarilyOpen = {};

/**
 * Returns the door holding state which tells is the door
 * supposed to be open or close due to calls to openDoor() and closeDoor()
 *
 * Note that calling openDoorForAMoment does
 * not affect the state.
 * @param door Door model
 */
exports.isDoorOpen = function(door) {
  if (exports.doorHoldState[door.id] === undefined) {

    if (doorserver.settings.get("doors")[door.id]) {
      exports.doorHoldState[door.id] = exports.DOOR_CLOSED;
    } else {
      console.error("Tried to call isDoorOpen for unknown door", JSON.stringify(door), "returning that door is closed, just in case");
    }

    return false;
  }

  return exports.doorHoldState[door.id] === exports.DOOR_OPEN;
};

/**
 * Opens door and keeps it open
 *
 * @param door Door model
 * @param cb
 */
exports.openDoor = function (door, cb) {

  var door_settings = doorserver.settings.get("doors")[door.id];
  if (!door_settings) {
    console.warn("Unknown door", JSON.stringify(door));
    cb(new Error("Unknown door", JSON.stringify(door)));
    return;
  }

  // Open door
  doorserver.drivers.piface.on(door_settings.relay_pin);
  if (exports.doorHoldState[door.id] !== exports.DOOR_OPEN) {
    console.log("Opened door", door.doorname, "(" + door.id + ")");
  }

  exports.doorHoldState[door.id] = exports.DOOR_OPEN;
  cb();
};

/**
 * Closes door and keeps it closed
 *
 * @param door
 * @param cb
 */
exports.closeDoor = function (door, cb) {

  var door_settings = doorserver.settings.get("doors")[door.id];
  if (!door_settings) {
    console.warn((new Date().toISOString()) + " Unknown door", door);
    cb(new Error("Unknown door " + door));
    return;
  }

  if (!exports.doorTemporarilyOpen[door.id]) {

    // Close door
    doorserver.drivers.piface.off(door_settings.relay_pin);
    if (exports.doorHoldState[door.id] !== exports.DOOR_CLOSED) {
      console.log("Closed door", door);
    }
  }

  exports.doorHoldState[door.id] = exports.DOOR_CLOSED;
  cb();
};

/**
 * Opens door for a moment and then closes it. If door was already open
 * then this function will not close the door.
 *
 * In any case this function will use the buzzle to signal that
 * the door is open.
 *
 * @param door Door model
 */
exports.openDoorForAMoment = function (door) {

  var door_settings = doorserver.settings.get("doors")[door.id];
  if (!door_settings) {
    console.warn("Unknown door", door.id, door.doorname);
    return;
  }

  // Open door only if door was closed
  if (!exports.isDoorOpen(door)) {

    // Mark that the door is temporarily open
    exports.doorTemporarilyOpen[door.id] = new Date();

    doorserver.drivers.piface.on(door_settings.relay_pin);

    // Schedule door close into future
    setTimeout(function () {

      // Mark that the door is no longer temporarily open
      delete exports.doorTemporarilyOpen[door.id];
      doorserver.drivers.piface.off(door_settings.relay_pin);
    }, door_settings.door_open_time);

    console.log((new Date().toISOString()) + " Opening door", JSON.stringify(door), "for", (door_settings.door_open_time / 1000), "seconds");
  } else {
    console.log((new Date().toISOString()) + " Asked to open door", JSON.stringify(door), "but it was already open");
  }

  // If we have buzzer, then turn it on
  if (door_settings.buzzer_pin) {
    doorserver.drivers.piface.on(door_settings.buzzer_pin);

    // And schedule buzzer stop into future
    setTimeout(function () {
      doorserver.drivers.piface.off(door_settings.buzzer_pin);
    }, door_settings.buzzer_time);

  }
};
