#!/bin/env node

var express = require("express"),
    crypto = require('crypto');
    db = require('./classes/db').DB.open(),
    config = require('./config').config;
var app = express();

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: config.SESSION_SECRET }));
app.use(app.router);

app.use(function (req, res, next) {
    res.type('application/json');
    next();
});

var restricted = function (req, res, next) {
    if (req.session.userId || req.session.test) {
        next()
    } else {
        errored(res, "Access Denied.");
    }
}


app.get('/', function (req, res) {
    res.send('{"message": "It\'s alive!", "version": "0.1.0", }');
});

app.get('/api/user', restricted, function (req, res) {
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

app.post('/api/user/register', function (req, res) {
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
                res.send({id: id, });
            },
            function (error) {
                errored(error);
            });
        }
    });
});

app.post('/api/user/login', function (req, res) {
    authenticate(req.body.email, req.body.password, function (error, user) {
        if (error) {
            res.type('application/json');
            res.send(error);
            return;
        }

        req.session.regenerate(function(){
            req.session.userId = user.id;
            res.send({});
        });
    });
});

app.post('/api/user/logout', restricted, function (req, res) {
    req.session.destroy();
    res.send({});
});

app.get('/api/notes', restricted, function (req, res) {

});

app.get('/api/notes/:id', restricted, function (req, res) {
    db.getNote(req.params.id, function (note) {

    }, function (error) {
        errored(error);
    });
});

app.post('/api/notes/:id/update', restricted, function (req, res) {

});

app.post('/api/notes/:id/delete', restricted, function (req, res) {

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

var hashPassword = function (plain) {
    var hasher = crypto.createHash('sha512');
    hasher.update(plain + config.PASSWORD_SALT, 'utf8');

    return hasher.digest('hex');
}

var errored = function (res, message) {
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