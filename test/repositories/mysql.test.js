
var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('mysql', function() {
  it("should connect to mysql database", function (done) {
    doorserver.repositories.mysql.fetchHandle("data", function (err, handle) {
      assert.ok(handle);
      assert.ifError(err);
      done();
    });

  });
});