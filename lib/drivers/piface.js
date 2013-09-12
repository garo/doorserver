/* jshint bitwise:false */

var simplespi;
try {
  simplespi = require('simplespi');
} catch (err) {
  simplespi = {
    send : function() {}
  };
  console.warn("SimpleSPI not available, PiFace is not enabled");
}

var PIN_TO_BITMASK = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];

var outputState = 0;

exports.init = function (cb) {
  simplespi.send("400a08");
  simplespi.send("401200");
  simplespi.send("400000");
  simplespi.send("4001ff");
  simplespi.send("400dff");

  outputState = 0;
  exports.flushOutputs();
  if (cb) {
    cb();
  }

};

exports.flushOutputs = function () {
  var cmd = "4012" + outputState.toString(16);
  console.log("flush cmd: ", cmd);
  simplespi.send(cmd);
};

exports.setOutput = function (pin, newValue) {
  if (pin >= 0 && pin <= 7) {
    outputState = (newValue ? outputState | PIN_TO_BITMASK[pin]
        : outputState & (~PIN_TO_BITMASK[pin]));

    exports.flushOutputs();
  } else {
    console.error("Invalid pin number (out of range):", pin);
  }
};

exports.on = function (pin) {
  this.setOutput(pin, 1);
};

exports.off = function (pin) {
  this.setOutput(pin, 0);
};






