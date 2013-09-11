
var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('getuser', function() {

	it("should be able to construct itself", function() {
		var cntr = doorserver.controllers.getuser;
		assert.ok(cntr);
	});

  it("should try to find user by id", function (done) {
    var findUserById = sinon.stub(doorserver.repositories.userRepository, 'findUserById', function(id, cb) {
      cb(null, new doorserver.models.User({id: 'existing_id'}));
    });

    var req = {
      params : {
        id : 123
      }
    };

    var res = {
      send : function(response) {
        assert.ok(findUserById.called);
        findUserById.restore();
        assert.equal(response.id, "existing_id");
        done();
      }
    };

    doorserver.controllers.getuser(req, res);
  });

  it("should return 404 if user was not found", function (done) {
    var findUserById = sinon.stub(doorserver.repositories.userRepository, 'findUserById', function(id, cb) {
      cb(null, null);
    });

    var req = {
      params : {
        id : 123
      }
    };

    var res = {
      send : function(response) {
        assert.ok(findUserById.called);
        findUserById.restore();
        assert.deepEqual({ message: 'User 123 not found',
          statusCode: 404,
          body: { code: 'ResourceNotFound', message: 'User 123 not found' },
          restCode: 'ResourceNotFound' }, response);
        done();
      }
    };

    doorserver.controllers.getuser(req, res);

  });

  it("should return 500 if repository returned an error", function (done) {
    var findUserById = sinon.stub(doorserver.repositories.userRepository, 'findUserById', function(id, cb) {
      cb(new Error("Unknown error"), null);
    });

    var req = {
      params : {
        id : 123
      }
    };

    var res = {
      send : function(response) {
        assert.ok(findUserById.called);
        findUserById.restore();
        assert.equal(500, response.statusCode);
        done();
      }
    };

    doorserver.controllers.getuser(req, res);

  });


});

