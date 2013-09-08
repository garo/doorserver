var doorserver = require('../doorserver');

module.exports = function (req, res) {

  doorserver.repositories.userRepository.findUserById(req.params.id, doorserver.logger, function (err, user) {
    res.jsonp(user);

  });
  

};

