var doorserver = require('../doorserver');

exports.findUserById = function (id, cb) {
  doorserver.repositories.mysql.fetchHandle("data", function (err, handle) {
    handle.query("SELECT * FROM doorserver_users WHERE id = ? AND enabled = 1", [id], function (err, rows) {
      if (err) {
        cb(err);
        return;
      }

      if (rows.length === 0) {
        cb(null, null);
        return;
      }

      cb(null, new doorserver.models.User(rows[0]));
    });
  });

};

exports.findUserByToken = function (token, cb) {
  doorserver.repositories.mysql.fetchHandle("data", function (err, handle) {
    handle.query("SELECT * FROM doorserver_users JOIN doorserver_keys ON (doorserver_keys.uid = doorserver_users.id) WHERE token = ? AND doorserver_users.enabled = 1 AND doorserver_keys.enabled = 1", [token], function (err, rows) {
      if (err) {
        cb(err);
        return;
      }

      if (rows.length === 0) {

        // This feature maps all unknown users to some pre-defined user.
        // After this all normal user privilege features work, such as
        // this unknown user can belong to a group which allows him to open
        // a specific door.
        var unknownuserid = doorserver.settings.get("unknownuserid");
        if (unknownuserid !== undefined && unknownuserid !== null) {

          // Try to find this user from db, or return a null user if this user was
          // in fact not found from database.
          exports.findUserById(unknownuserid, cb);
        } else {
          cb(null, null);
        }

        return;
      }

      cb(null, new doorserver.models.User(rows[0]));
    });
  });

};

/**
 * Checks if given user (user_id) is allowed to open door (Door model)
 * via a group mapping.
 *
 * - User belongs to a list of groups
 * - Each group have a list of doors which the group is allowed to open
 * - A group can be temporarly disabled by setting doorserver_group.enabled = 0
 *
 * Returns (via callback) an array of objects containing the following properties:
 * {
 *  groupid : <id as of doorserver_groups.id>,
 *  groupname : <name as of doorserver_groups.name>,
 *  doorid : <id as of doorserver_doors.id>,
 *  doorname : <name as of doroserver_doors.name>
 * }
 *
 * A single user can be given access to a single door via multiple groups, that's why
 * this function returns an array
 *
 * @param user_id
 * @param door Door model
 * @param cb (err, groups array)
 */
exports.findAllGroupsForUserForDoor = function (user_id, door, cb) {
  doorserver.repositories.mysql.fetchHandle("data", function (err, handle) {
    var sql = "SELECT doorserver_groups.id as groupid, " +
            "doorserver_groups.name as groupname, " +
            "doorserver_doors.doorname as doorname, " +
            "doorserver_doors.id as doorid " +
            "FROM doorserver_user_to_group, doorserver_groups," +
            "doorserver_door_to_group, doorserver_doors " +
            "WHERE doorserver_user_to_group.uid = ? AND " +
            "doorserver_user_to_group.groupid = doorserver_groups.id AND " +
            "doorserver_door_to_group.groupid = doorserver_groups.id AND " +
            "doorserver_doors.id = doorserver_door_to_group.doorid AND " +
            "doorserver_doors.id = ? AND " +
            "doorserver_groups.enabled = 1";

    //console.log(sql);

    handle.query(sql,
        [user_id, door.id], function (err, rows) {
          if (err) {
            cb(err);
            return;
          }

          // Check function documentation above about the returned object
          cb(null, rows);
        });
  });

};
