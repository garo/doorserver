
var assert = require('assert');
var sinon = require('sinon');
var piface = require('../../lib/drivers/piface');

describe('piface', function() {
		var pf;
  it("should construct", function () {
    pf = new piface();
			assert.ok(pf);


  });

		it("should be able to turn relay on and off", function(done) {
				pf.on(1);
				setTimeout(function() {
						pf.off(1);
						done();
				}, 500);

				pf.on(3);
				pf.on(4);

		});

});