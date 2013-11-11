
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
  });

  it("should support type:'hexinput' and convert token from hex to dec", function (done) {
    var driver = new doorserver.drivers.usbkeyboard({
      door_id : 1000,
      type :"hexinput"
    });

    driver.on('token', function (packet) {
      assert.ok(packet.token, "0013958495");
      assert.ok(packet.door_id, 1000);
      done();
    });

    driver.emit('rawtoken', {
      rawtoken : "00D4FD5F",
      door_id : 1000
    });

  });

  it("should pass rawtoken as-is to token event when no type has been set", function (done) {
    var driver = new doorserver.drivers.usbkeyboard({
      door_id : 1000
    });

    driver.on('token', function (packet) {
      assert.ok(packet.token, "0013958495");
      assert.ok(packet.door_id, 1000);
      done();
    });

    driver.emit('rawtoken', {
      rawtoken : "0013958495",
      door_id : 1000
    });

  });

  describe("convertHexInput", function() {

    it("should convert correctly when padding is needed", function() {
      var driver = new doorserver.drivers.usbkeyboard({
        door_id : 1000,
        type : "hexinput"
      });

      assert.equal("0013958495", driver.convertHexInput("00D4FD5F"));
      assert.equal("0000064863", driver.convertHexInput("0000FD5F"));
      assert.equal("0000064863", driver.convertHexInput("FD5F"));

    });


    it("should convert correctly when token is more than 10 chars", function() {
      var driver = new doorserver.drivers.usbkeyboard({
        door_id : 1000,
        type : "hexinput"
      });

      assert.equal("1839525543154", driver.convertHexInput("01AC4C443CF2"));
      assert.equal("1839525543154", driver.convertHexInput("1AC4C443CF2"));
      assert.equal("80011907311", driver.convertHexInput("12A114D0EF"));

    });

  });

});