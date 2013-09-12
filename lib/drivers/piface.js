/* jshint bitwise:false */

var simplespi = require('simplespi');

var PIN_TO_BITMASK = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];

var PiFace = module.exports = function(device) {
		simplespi.send("400a08");
		simplespi.send("401200");
		simplespi.send("400000");
		simplespi.send("4001ff");
		simplespi.send("400dff");

		this.output = 0;
		this.flushOutputs();

};

PiFace.prototype.flushOutputs = function() {
		var cmd = "4012" + this.output.toString(16);
		console.log("flush cmd: ", cmd);
		simplespi.send(cmd);
};

PiFace.prototype.setOutput = function(pin, newValue) {
		if (pin >= 0 && pin <= 7) {
				this.output = (newValue ? this.output | PIN_TO_BITMASK[pin]
                    : this.output & (~PIN_TO_BITMASK[pin]));

				this.flushOutputs();
		} else {
				console.error("Invalid pin number (out of range):", pin);
		}
};

PiFace.prototype.on = function(pin) {
		this.setOutput(pin, 1);
};

PiFace.prototype.off = function(pin) {
		this.setOutput(pin, 0);
};






