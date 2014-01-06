var moment = require('moment');

var Timeperiod = module.exports = function (data, rules) {
  this.id = data.id;
  this.name = data.name;

  this.include_rules = [];
  this.exclude_rules = [];

  this.valid = true;

  // Iterate thru all rules and divide them between inclusion and exclusion rules
  var date = new Date();
  for (var i = 0; i < rules.length; i++) {

    // Validate the rule
    if (Timeperiod.check_time_period(date, rules[i].rule) === null) {
      this.valid = false;
    } else {
      if (rules[i].exclude === 0) {
        this.include_rules.push(rules[i]);
      } else if (rules[i].exclude === 1) {
        this.exclude_rules.push(rules[i]);
      }
    }
  }

};



// Turn true for vergose debuggin output
Timeperiod.debug = false;

/**
 * Checks if given Date falls within the Timeperiod.
 *
 * This is done by first checking if any of the high priority inclusion rules match. These
 * rules have the "DD.MM.YYYY,HH:MM-HH:MM" syntax. If a rule matches then the evaluation
 * result is true and no other rules are evaluated.
 *
 * If no high priority rules matched, then all normal inclusion rules matches.
 * First matching rule stops the evaluation and the evaluation result is proposed to be true.
 *
 * After that exclusion rules are checked if they prevent the possible match. First matching
 * rule stops the evaluation and the evaluation result is set to false, even it it was
 * first set to true by a matching inclusion rule.
 *
 * The default is to exclude in case there's no matching inclusion rule (DEFAULT DENY policy)
 *
 * Returns an object with following properties:
 * {
 *   valid : <boolean> tells if Date was ok or not
 *   because_of_rule : <Object> Rule object which determined the final outcome
 * }
 * @param date Date
 */
Timeperiod.prototype.evaluate = function (date) {

  var valid = false;
  var because_of_rule = "<implict default>";

  var i, l = this.include_rules.length;
  for (i = 0; i < l; i++) {
    if (Timeperiod.is_rule_day_inclusive(this.include_rules[i].rule) === true &&
        Timeperiod.check_time_period(date, this.include_rules[i].rule) === true) {
      valid = true;
      because_of_rule = this.include_rules[i];

      // Day inclusive rules take order above anything else
      return {
        valid:valid,
        because_of_rule:because_of_rule
      };
    }
  }

  l = this.include_rules.length;
  for (i = 0; i < l; i++) {
    if (Timeperiod.check_time_period(date, this.include_rules[i].rule) === true) {
      valid = true;
      because_of_rule = this.include_rules[i];

      // Stop on first valid rule
      break;
    }
  }

  l = this.exclude_rules.length;
  for (i = 0; i < l; i++) {
    if (Timeperiod.check_time_period(date, this.exclude_rules[i].rule) === true) {
      valid = false;
      because_of_rule = this.exclude_rules[i];

      // Stop on first valid rule
      break;
    }
  }

  return {
    valid:valid,
    because_of_rule:because_of_rule
  };
};

/**
 * Checks if rule is a high priority inclusive day rule in form of
 * "DD.MM.YYYY,HH:MM-HH:MM"
 * also dates with just single digit numbers are accepted, like D.M.YYYY and DD.M.YYYY and D.M.YYYY
 *
 * @param period
 * @return boolean
 */
Timeperiod.is_rule_day_inclusive = function(period) {
  var m = /^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{1,4}),([0-9]{2}):([0-9]{2})-([0-9]{2}):([0-9]{2})$/.exec(period);
  if (m) {
    return true;
  } else {
    return false;
  }
};


/**
 * Checks if timestamp falls into a time period represented as a string
 *
 * String has the following options for format:
 *  - "1-7,00:00-23:59" means from Mondays (1) to Sundays (7)
 *  - "1,00:00-23:59" means that every Monday (1)
 *  - "24.12." means that on the 24th day of December (x-mas eve)
 *  - "24.12.-26.12." means that starting the 24th day of December at 00:00 and ending on 26th day at 23:59
 *
 *
 * @param date Date
 * @param period String
 */
Timeperiod.check_time_period = function (date, period) {

  var m;
  var d1, d2, h1, m1, h2, m2, month1, month2;
  var date1, date2;

  // Iterate thru all different ways to express the date range

  // Start with "1,00:00-23:59"
  m = /^([0-9]),([0-9]{2}):([0-9]{2})-([0-9]{2}):([0-9]{2})$/.exec(period);
  if (m) {
    if (Timeperiod.debug) {
      console.log(period, "matched 1,00:00-23:59 format");
    }
    d1 = Number(m[1]);
    d2 = Number(m[1]);
    h1 = Number(m[2]);
    m1 = Number(m[3]);
    h2 = Number(m[4]);
    m2 = Number(m[5]);
    date1 = moment(date).day(d1).hour(h1).minute(m1).second(0).toDate();
    date2 = moment(date).day(d2).hour(h2).minute(m2).second(59).toDate();
  }


  // If not, try with a day-of-year region
  if (!m) {

    // "24.12.-26.12." (closed on x-mas holidays)
    m = /^([0-9]{1,2})\.([0-9]{1,2})\.-([0-9]{1,2})\.([0-9]{1,2})\.$/.exec(period);
    if (m) {
      if (Timeperiod.debug) {
        console.log(period, "matched 24.12.-26.12. format");
      }

      d1 = Number(m[1]);
      month1 = Number(m[2]) + 1; // Months start from Jan == 0, so we need to inc that with one
      d2 = Number(m[3]);
      month2 = Number(m[4]) + 1; // Months start from Jan == 0, so we need to inc that with one

      date1 = moment(date).month(month1).date(d1).hour(0).minute(0).second(0).toDate();
      date1 = moment(date).month(month2).date(d2).hour(23).minute(59).second(59).toDate();
    }
  }

  // Then try with a single day-of-year
  if (!m) {
    // "24.12." (closed on x-mas eve)
    m = /^([0-9]{1,2})\.([0-9]{1,2})\.$/.exec(period);
    if (m) {
      if (Timeperiod.debug) {
        console.log(period, "matched 24.12. format");
      }

      d1 = Number(m[1]);
      month1 = Number(m[2]) - 1; // in moment.js Months start from Jan == 0, so we need to decrement that with one

      date1 = moment(date).month(month1).date(d1).hour(0).minute(0).second(0).toDate();
      date2 = moment(date).month(month1).date(d1).hour(23).minute(59).second(59).toDate();
    }
  }

  // Then a single day on specified year with time
  if (!m) {
    // "6.1.2014,10:00-14:00"
    m = /^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{1,4}),([0-9]{2}):([0-9]{2})-([0-9]{2}):([0-9]{2})$/.exec(period);
    if (m) {
      if (Timeperiod.debug) {
        console.log(period, "matched 6.1.2014,10:00-14:00 format");
      }

      d1 = Number(m[1]);
      month1 = Number(m[2]) - 1; // in moment.js Months start from Jan == 0, so we need to decrement that with one
      var year1 = Number(m[3]);

      h1 = Number(m[4]);
      m1 = Number(m[5]);
      h2 = Number(m[6]);
      m2 = Number(m[7]);

      date1 = moment(date).year(year1).month(month1).date(d1).hour(h1).minute(m1).second(0).toDate();
      date2 = moment(date).year(year1).month(month1).date(d1).hour(h2).minute(m2).second(59).toDate();

    }
  }

  // All formats above can be determined with this simple expression
  if (m) {
    if (Timeperiod.debug) {
      console.log(date, date1, date2);
      if (date >= date1) {
        console.log("date", date, "is gte", date1);
      } else {
        console.log("not match: date", date, "is not gte", date1);
      }

      if (date <= date2) {
        console.log("date", date, "is lte", date2);
      } else {
        console.log("not match: date", date, "is not lte", date2);
      }
    }

    return (date >= date1 && date <= date2);
  }

  // But this needs a different logic: the multiple day period "1-7,00:00-23:59"
  m = /^([0-9])-([0-9]),([0-9]{2}):([0-9]{2})-([0-9]{2}):([0-9]{2})$/.exec(period);
  if (m) {
    d1 = Number(m[1]);
    d2 = Number(m[2]);
    h1 = Number(m[3]);
    m1 = Number(m[4]);
    h2 = Number(m[5]);
    m2 = Number(m[6]);

    // Iterate thru each day
    for (var i = d1; i <= d2; i++) {
      var t = i;
      if (t == 7) { // Transform sunday into zero as moment()s weeks starts from sundays
        t = 0;
      }

      date1 = moment(date).day(t).hour(h1).minute(m1).second(0).toDate();
      date2 = moment(date).day(t).hour(h2).minute(m2).second(59).toDate();
      if (date >= date1 && date <= date2) {
        if (Timeperiod.debug) {
          console.log("Date", date, "falls inside range at day", i);
        }
        return true;
      }
    }

    if (Timeperiod.debug) {
      console.log("Date", date, "did not fall into any of the days [", d1, ",", d2, "] range");
      console.log("date1", date1);
      console.log("date2", date2);
    }
    return false;
  }


  if (!m) {
    console.warn("Invalid date period string", period);
    return null;
  }

};

