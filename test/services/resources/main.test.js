var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../../lib/doorserver');

describe('resource:main', function () {
  it("should have .index function", function() {
    assert.ok(doorserver.services.resources.main.index);
  });
});
