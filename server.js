#!/bin/env node

var express = require("express"),
    crypto = require('crypto');
    db = require('./classes/db').DB.open(),
    config = require('./config').config;
var app = express();

app.use(express.bodyParser());
app.use(express.session({ secret: config.SESSION_SECRET })); 

app.get('/', function (req, res) {
    res.type('application/json');
    res.send('{"message": "It\'s alive!", "version": "0.1.0", }');
});

app.post('/api/users', function (req, res) {
    if (req.body.name.length <= 0) {
        errored(res, "Name is required.");
        return;
    }

    if (req.body.email.length <= 0) {
        errored(res, "Email is required.");
        return;
    }

    if (req.body.password.length <= 0) {
        errored(res, "Password is required.");
        return;
    }

    var emailLower = req.body.email.toLowerCase();
    db.checkEmail(emailLower, function (exists) {
        if (exists) {
            errored(res, "Email already exists.");
        } else {
            var name = req.body.name;
            var email = emailLower;
            var password = hashPassword(req.body.password);

            db.createUser(name, email, password, function (id) {
                res.type('application/json');
                res.send({id: id, });
            },
            function (error) {
                errored(error);
            });
        }
    });
});

app.get('/api/users/:id', function (req, res) {
    db.getUserFromId(req.params.id, function (user) {
        if (!user) {
            errored(res, "User not found.");
            return;
        }

        var response = {
            name: user.name,
            email: user.email,
        };

        res.type('application/json');
        res.send(response);
    }, function (error) {
        errored(error);
    });
});

app.post('/api/users/login', function (req, res) {
    authenticate(req.body.email, req.body.password, function (error, user) {
        if (error) {
            res.type('application/json');
            res.send(error);
            return;
        }

        // Generate and return token

    });
});

app.post('/api/users/logout', function (req, res) {
    var db = new pg.Client(dbConfig);


    res.type('application/json');
    res.send('{"message": "it works!", "version": "0.0.1", }');
});

app.get('/api/notes/:id', function (req, res) {
    db.getNote(req.params.id, function (note) {

    }, function (error) {
        errored(error);
    });
});

app.post('/api/notes/:id', function (req, res) {
    var db = new pg.Client(dbConfig);


    res.type('application/json');
    res.send('{"message": "it works!", "version": "0.0.1", }');
});

app.post('/api/notes/update/:id', function (req, res) {
    var db = new pg.Client(dbConfig);


    res.type('application/json');
    res.send('{"message": "it works!", "version": "0.0.1", }');
});

app.post('/api/notes/:id', function (req, res) {
    var db = new pg.Client(dbConfig);


    res.type('application/json');
    res.send('{"message": "it works!", "version": "0.0.1", }');
});

var authenticate = function (email, password, completion) {
    if (!email || email.length == 0) {
        completion({ errorMessage: "Email cannot be blank", });
    }

    if (!password || password.length == 0) {
        completion({ errorMessage: "Password cannot be blank", });
    }

    var emailLower = email.toLowerCase();
    var passwordHashed = hashPassword(password);

    db.getUserFromEmail(email, function (user) {
        if (user) {
            if (passwordHashed === user.password) {
                completion(null, user);
            } else {
                completion({ errorMessage: "Passwords do not match.", });
            }
        } else {
            var message = "No user found with the email " + email + ".";
            completion({ errorMessage: message, });
        }
    }, function (error) {
        completion({ errorMessage: "DatabaseError", });
    });
}


var restricted = function (req, res, next) {

}

var hashPassword = function (plain) {
    var hasher = crypto.createHash('sha512');
    hasher.update(plain + config.PASSWORD_SALT, 'utf8');

    return hasher.digest('hex');
}

var errored = function (res, message) {
    res.type('application/json');
    res.send({errorMesage: message});
}

process.on('exit', function () {
    db.close();
    process.exit(0);
});

process.on('SIGINT', function () {
    db.close();
    process.exit(2);
});

app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080);