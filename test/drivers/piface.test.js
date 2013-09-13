var assert = require('assert');
var sinon = require('sinon');
var piface = require('../../lib/drivers/piface');

describe('piface', function () {
  var pf;
  it("should have init", function () {

    assert.ok(piface.init);


  });

  it("should be able to turn relay on and off", function (done) {
    piface.on(1);
    setTimeout(function () {
      piface.off(1);
      piface.off(3);
      piface.off(4);

      done();
    }, 200);

    piface.on(3);
    piface.on(4);

  });

});