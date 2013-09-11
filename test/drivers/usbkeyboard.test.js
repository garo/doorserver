
var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('usbdriver', function() {
  it("should construct", function () {
    var driver = new doorserver.drivers.usbkeyboard({
      door_id : 1000
    });
    assert.ok(driver);
    assert.equal(driver.cfg.door_id, 1000);
  });

  it("should suppor EventEmitter", function (done) {
    var driver = new doorserver.drivers.usbkeyboard({
      door_id : 1000
    });

    driver.on('token', function (packet) {
      assert.ok(packet.token, "the token");
      assert.ok(packet.door_id, 1000);
      done();
    });

    driver.emit('token', {
      token : "the token",
      door_id : 1000
    });
  })

});