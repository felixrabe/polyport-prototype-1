
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'If only you knew' }));
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function() {
    app.use(express.errorHandler()); 
});

// Data

function Package(user, description, from, to) {
    this.user = user;
    this.description = description;
    this.from = from;
    this.to = to;
}

function Route(user, from, to, notes) {
    this.user = user;
    this.from = from;
    this.to = to;
    this.notes = notes;
}

var packages = [];  // packages.push(new Package(...));
var routes = [];  // routes.push(new Route(...));

// Middleware

function userSession(req, res, next) {
    if (req.session.email) {
        next();
    } else {
        res.render('login');
    }
}

// URL Routes

app.post('/', function(req, res, next) {  // The login page form POSTs here
    req.session.email = req.body.email;  // Record form data in the session
    res.redirect('/');
});

app.get('/', userSession, function(req, res) {
    res.local('flash', req.flash());
    res.render('index', {
        email: req.session.email
    });
});

app.get('/logout', function(req, res) {
    if (req.session.email) {
        delete(req.session.email);
    }
    res.redirect('/');
});

app.get('/package/new', userSession, function(req, res) {
    res.render('package/new');
});

app.post('/package/new', userSession, function(req, res) {
    packages.push(new Package(req.session.email, req.body.description, req.body.from, req.body.to));
    req.flash('info', 'Package registered successfully. We\'ve got ' + packages.length + ' packages now.');
    res.redirect('/');
});

app.all('/package/*', userSession, function(req, res) {
    res.render('unimplemented');
});

app.get('/route/new', userSession, function(req, res) {
    res.render('route/new');
});

app.post('/route/new', userSession, function(req, res) {
    routes.push(new Route(req.session.email, req.body.from, req.body.to, req.body.notes));
    req.flash('info', 'Route registered successfully. We\'ve got ' + routes.length + ' routes now.');
    res.redirect('/');
});

app.all('/route/*', userSession, function(req, res) {
    res.render('unimplemented');
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
