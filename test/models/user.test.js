
var assert = require('assert');
var doorserver = require('../../lib/doorserver');

describe('user model', function() {
  it("should read attributes from constructor first argument", function() {

    var user = new doorserver.models.User({
      id : "id",
      token : "token",
      name : "name"
    });

    assert.equal(user.id, "id");
    assert.equal(user.name, "name");
    assert.equal(user.token, "token");

  });

});

