var pg = require("pg");

var DB = function () {
    var dbConfig = process.env.OPENSHIFT_POSTGRESQL_DB_URL || "postgres://shannin@localhost:5432/dashboardnotes";
    var client = null;

    var singleton = {};

    singleton.open = function() {
        client = new pg.Client(dbConfig);
        client.connect();

        return singleton;
    };

    singleton.close = function () {
        client.end();
    };

    singleton.createUser = function (name, email, password, callback, error) {
        var query = createQuery("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id", error, [name, email, password]);

        query.on("end", function (result) {
            if (callback) {
                callback(result.rows[0].id);
            }
        });
    };

    singleton.getUserFromId = function (userId, callback, error) {
        var query = createQuery("SELECT * FROM users WHERE id = $1", error, [userId]);

        query.on("end", function (result) {
            if (callback) {
                var row = result.rows[0];
                callback(row);
            }
        });
    };

    singleton.getUserFromEmail = function (email, callback, error) {
        var query = createQuery("SELECT * FROM users WHERE email = $1", error, [email]);

        query.on("end", function (result) {
            if (callback) {
                var row = result.rows[0];
                callback(row);
            }
        });
    };

    singleton.checkEmail = function (email, callback, error) {
        var query = createQuery("SELECT COUNT(*) FROM users WHERE email = $1", error, [email]);

        query.on("end", function (result) {
            if (callback) {
                callback(result.rows[0].count == 1);
            }
        });
    };

    singleton.updateUser = function (id, name, email, callback, error) {
        var query = createQuery("UPDATE users SET name = $1, email = $2 WHERE id = $3", error, [name, email, id]);

        query.on("end", function (result) {
            if (callback) {
                callback();
            }
        });
    };

    singleton.updateUserPassword = function (id, newPassword, callback, error) {
        var query = createQuery("UPDATE users SET password = $1 WHERE id = $2", error, [newPassword, id]);

        query.on("end", function (result) {
            if (callback) {
                callback();
            }
        });
    };


    singleton.createNote = function (userId, note, callback, error) {
        var query = createQuery("INSERT INTO notes (user_id, note) VALUES ($1, $2) RETURNING id", error, [userId, note]);

        query.on("end", function (result) {
            if (callback) {
                callback(result.rows[0].id);
            }
        });
    };

    singleton.getNote = function (noteId, callback, error) {
        var query = createQuery("SELECT * FROM notes WHERE id = $1", error, [noteId]);

        query.on("end", function (result) {
            if (callback) {
                var row = result.rows[0];
                callback(row);
            }
        });
    };

    singleton.updateNote = function (nodeId, note, callback, error) {
        var query = createQuery("UPDATE notes SET note = $1 WHERE id = $2", error, [note, nodeId]);

        query.on("end", function (result) {
            if (callback) {
                callback();
            }
        });
    };

    singleton.deleteNote = function (nodeId, callback, error) {
        var query = createQuery("DELETE FROM notes WHERE id = $1", error, [nodeId]);

        query.on("end", function (result) {
            if (result.rowCount == 0) {
                if (error) {
                    error();
                }
                return;
            }

            if (callback) {
                callback();
            }
        });
    };

    singleton.query = function(query, callback, error) {
        var query = createQuery(query, error);

        query.on("end", function (result) {
            if (callback) {
                callback(result.rows);
            }
        });
    };

    var createQuery = function (sql, error, params) {
        var query = client.query(sql, params);

        query.on('row', function(row, result) {
            result.addRow(row);
        });

        query.on('error', function (err) {
            errored(err, error);
        });

        return query;
    }

    var errored = function (err, callback) {
        console.log("DB Error: ", err);
        if (callback) {
            callback(err);
        }
    }

    return singleton;
}

exports.DB = DB();