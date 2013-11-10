var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('restful', function () {
  it("should have .init function", function(done) {
    doorserver.services.restful.init(function (err) {
      assert.ifError(err);
      doorserver.services.restful.deinit(done);
    });
  });

});