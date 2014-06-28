#!/bin/env node

var express = require("express"),
    crypto = require('crypto');
    db = require('./classes/db').DB.open();
var app = express();

var PASSWORD_SALT = "this is a long salt string ot make sure that nobody tries to take the passwords 734095837450470274732948529834750938475093845623987263507984578-60976734872368129746230598346749508634872350187346-234589347609386528734512987464-8934756034856230847623059834-5";

app.use(express.bodyParser());
//app.use(express.session({})); 

app.get('/', function (req, res) {
    res.type('application/json');
    res.send('{"message": "It\'s alive!", "version": "0.1.0", }');
});

app.post('/api/users', function (req, res) {
    if (req.body.name.length <= 0) {
        errored(res, "Name is required.")
    }

    if (req.body.email.length <= 0) {
        errored(res, "Email is required.")
    }

    if (req.body.password.length <= 0) {
        errored(res, "Password is required.")
    }

    db.checkEmail(email, function (exists) {
        if (exists) {
            errored(res, "Email already exists")
        } else {
            var name = req.body.name;
            var email = req.body.email;
            var password = encodePassword(req.body.password);

            db.createUser(name, email, password, function (id) {

            },
            function (error) {
                errored(error);
            });
        }
    });
});

app.get('/api/users/:id', function (req, res) {
    db.getUser(req.params.id, function (user) {
        var response = {
            user: user.name,
            email: user.email,
        };

        res.type('application/json');
        res.send(response);
    }, function (error) {

    });
});

app.post('/api/users/login', function (req, res) {
    var db = new pg.Client(dbConfig);

    var client = new pg.Client(dbConfig);
    client.connect();




    res.type('application/json');
    res.send('{"message": "it works!", "version": "0.0.1", }');
});

app.post('/api/users/logout', function (req, res) {
    var db = new pg.Client(dbConfig);


    res.type('application/json');
    res.send('{"message": "it works!", "version": "0.0.1", }');
});

app.get('/api/notes/:id', function (req, res) {
    var db = new pg.Client(dbConfig);


    res.type('application/json');
    res.send('{"message": "it works!", "version": "0.0.1", }');
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

}

var restricted = function (req, res, next) {

}

var hashPassword = function (plain) {
    var hasher = crypto.createHash('sha512');
    hasher.update(plain + PASSWORD_SALT, 'utf8');

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