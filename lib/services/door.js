var doorserver = require('../doorserver');

exports.DOOR_CLOSED = 0;
exports.DOOR_OPEN = 1;

exports.doorHoldState = {};

/**
 * Returns the door holding state which tells is the door
 * supposed to be open or close due to calls to openDoor() and closeDoor()
 *
 * Note that calling openDoorForAMoment does
 * not affect the state.
 * @param door_id
 */
exports.isDoorOpen = function(door_id) {
  if (exports.doorHoldState[door_id] === undefined) {
    console.error("Tried to call isDoorOpen for unknown door_id", door_id, "returning that door is closed, just in case");
    return false;
  }

  return exports.doorHoldState[door_id] === exports.DOOR_OPEN;
};

/**
 * Opens door and keeps it open
 *
 * @param door_id
 * @param cb
 */
exports.openDoor = function (door_id, cb) {

  var door_settings = doorserver.settings.get("doors")[door_id];
  if (!door_settings) {
    console.warn("Unknown door", door_id);
    return;
  }

  // Open door
  doorserver.drivers.piface.on(door_settings.relay_pin);

  exports.doorHoldState = exports.DOOR_OPEN;
  cb();
};

/**
 * Closes door and keeps it closed
 *
 * @param door_id
 * @param cb
 */
exports.closeDoor = function (door_id, cb) {

  var door_settings = doorserver.settings.get("doors")[door_id];
  if (!door_settings) {
    console.warn("Unknown door", door_id);
    return;
  }

  // Open door
  doorserver.drivers.piface.off(door_settings.relay_pin);

  exports.doorHoldState = exports.DOOR_CLOSED;
  cb();
};

/**
 * Opens door for a moment and then closes it. If door was already open
 * then this function will not close the door.
 *
 * In any case this function will use the buzzle to signal that
 * the door is open.
 *
 * @param door_id
 */
exports.openDoorForAMoment = function (door_id) {

  var door_settings = doorserver.settings.get("doors")[door_id];
  if (!door_settings) {
    console.warn("Unknown door", door_id);
    return;
  }

  // Open door only if door was closed
  if (exports.doorHoldState === exports.DOOR_CLOSED) {
    doorserver.drivers.piface.on(door_settings.relay_pin);

    // Schedule door close into future
    setTimeout(function () {
      doorserver.drivers.piface.off(door_settings.relay_pin);
    }, door_settings.door_open_time);

    console.log("Opening door", door_id, "for", (door_settings.door_open_time / 1000), "seconds");
  } else {
    console.log("Asked to open door", door_id, "but it was already open");
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
