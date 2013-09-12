var doorserver = require('../doorserver');

exports.openDoorForAMoment = function (door_id) {

  var door_settings = doorserver.settings.get("doors")[door_id];
  if (!door_settings) {
    console.warn("Unknown door", door_id);
    return;
  }

  // Open door
  doorserver.drivers.piface.on(door_settings.relay_pin);

  // Schedule door close into future
  setTimeout(function () {
    doorserver.drivers.piface.off(door_settings.relay_pin);
  }, door_settings.door_open_time);

  // If we have buzzer, then turn it on
  if (door_settings.buzzer_pin) {
    doorserver.drivers.piface.on(door_settings.buzzer_pin);

    // And schedule buzzer stop into future
    setTimeout(function () {
      doorserver.drivers.piface.off(door_settings.buzzer_pin);
    }, door_settings.buzzer_time);

  }
  console.log("Opening door", door_id, "for", (door_settings.door_open_time / 1000), "seconds");
};
