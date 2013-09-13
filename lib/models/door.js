var Door = module.exports = function(data) {
  this.id = data.id;
  this.doorname = data.doorname;

  if (data.timeperiod_id) {
    this.timeperiod_id = Number(data.timeperiod_id);
  } else {
    this.timeperiod_id = null;
  }
};

