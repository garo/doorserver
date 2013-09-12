var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var EV_KEY = 1,
    EVENT_TYPES = ['keyup', 'keypress', 'keydown'];


var UsbKeyboard = module.exports = function (cfg) {
  this.buffer = "";
  this.cfg = cfg;
};

UsbKeyboard.prototype = Object.create(EventEmitter.prototype, {
  constructor:{value:UsbKeyboard}
});


UsbKeyboard.prototype.start = function (cb) {
  var self = this;

  this.keyboard = new Keyboard(self.cfg.device);
  this.keyboard.on('keypress', function (event) {
    if (event.keyId == "\n") {
      self.emit('token', {
        token:self.buffer,
        door_id:self.cfg.door_id
      });
      self.buffer = "";
    } else {
      self.buffer += event.keyId;
    }
  });

  cb();
};

/**
 *
 * Read Linux Inputs in node.js
 * Author: William Petit (william.petit@lookingfora.name)
 *
 * Slightly modified by Juho Garo Makinen for this project.
 *
 * Adapted from Tim Caswell's nice solution to read a linux joystick
 * http://nodebits.org/linux-joystick
 * https://github.com/nodebits/linux-joystick
 *
 * @param dev
 */
function Keyboard(dev) {
  this.wrap('onOpen');
  this.wrap('onRead');
  this.dev = dev;
  this.bufferSize = 16;
  this.buf = new Buffer(this.bufferSize);
  fs.open(this.dev, 'r', this.onOpen);
}

Keyboard.prototype = Object.create(EventEmitter.prototype, {
  constructor:{value:Keyboard}
});

Keyboard.prototype.wrap = function (name) {
  var self = this;
  var fn = this[name];
  this[name] = function (err) {
    if (err) return self.emit('error', err);
    return fn.apply(self, Array.prototype.slice.call(arguments, 1));
  };
};

Keyboard.prototype.onOpen = function (fd) {
  this.fd = fd;
  this.startRead();
};

Keyboard.prototype.startRead = function () {
  fs.read(this.fd, this.buf, 0, this.bufferSize, null, this.onRead);
};

Keyboard.prototype.onRead = function (bytesRead) {
  var event = parse(this, this.buf);
//    console.log("event:", event);
  if (event) {
    event.dev = this.dev;
    this.emit(event.type, event);
  }
  if (this.fd) this.startRead();
};

Keyboard.prototype.close = function (callback) {
  fs.close(this.fd, function () {
    console.log(this);
  });
  this.fd = undefined;
};

/**
 * Parse Input data
 */

function parse(input, buffer) {

  var event, value;

  var type = buffer.readUInt16LE(8);
  if (type === EV_KEY) {

    event = {
      timeS:buffer.readUInt32LE(0),
      timeMS:buffer.readUInt32LE(4),
      keyCode:buffer.readUInt16LE(10)
    };

    event.keyId = findKeyID(event.keyCode);
    event.type = EVENT_TYPES[ buffer.readUInt32LE(12) ];
  }

  return event;
}

// Keys
var Keys = {};

Keys["KEY_ESC"] = 1;
Keys["1"] = 2;
Keys["2"] = 3;
Keys["3"] = 4;
Keys["4"] = 5;
Keys["5"] = 6;
Keys["6"] = 7;
Keys["7"] = 8;
Keys["8"] = 9;
Keys["9"] = 10;
Keys["0"] = 11;
Keys["-"] = 12;
Keys["="] = 13;
Keys["Q"] = 16;
Keys["W"] = 17;
Keys["E"] = 18;
Keys["R"] = 19;
Keys["T"] = 20;
Keys["Y"] = 21;
Keys["U"] = 22;
Keys["I"] = 23;
Keys["O"] = 24;
Keys["P"] = 25;
Keys["\n"] = 28;
Keys["A"] = 30;
Keys["S"] = 31;
Keys["D"] = 32;
Keys["F"] = 33;
Keys["G"] = 34;
Keys["H"] = 35;
Keys["J"] = 36;
Keys["K"] = 37;
Keys["L"] = 38;
Keys["SEMICOLON"] = 39;
Keys["APOSTROPHE"] = 40;
Keys["GRAVE"] = 41;
Keys["Z"] = 44;
Keys["X"] = 45;
Keys["C"] = 46;
Keys["V"] = 47;
Keys["B"] = 48;
Keys["N"] = 49;
Keys["M"] = 50;
Keys[","] = 51;
Keys["."] = 52;
Keys["\\"] = 53;
Keys["/"] = 54;
Keys[" "] = 57;

Keyboard.Keys = Keys;

/**
 * Find Key Id
 */

function findKeyID(keyCode) {
  var key, value;
  for (key in Keys) {
    if (Keys.hasOwnProperty(key)) {
      if (Keys[key] === keyCode) {
        return key;
      }
    }
  }
}



