var express = require('express');
var http = require('http');
var io = require('socket.io');
var less = require('less');
var fs = require('fs');
var console = require('console');

var User = require('./user.js');
var Link = require('./link.js');
var Comment = require('./comment.js');

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};

var app = express();
app.use(allowCrossDomain);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: '2234567890QWERTY'}));
app.use(app.router);


var clientCssFile = 'client.less';
var clientCss = '';
function renderCss(){
	fs.readFile(clientCssFile, { 'encoding': 'utf-8' }, function(err, data){
		if (err) throw err;
		less.render(data, function(e, css){
			if (e) throw e;
			clientCss = css;
		});
	});    
}
renderCss();
fs.watch('.', function(event, filename){ // re-render css if it changes
  // watch directory instead of file because of editors using tempfile -> rename for atomicity (watch works on inodes on linux)
  if (filename === clientCssFile){
  	renderCss();
  }
});

var log = console.log;

function checkAuth(req, res, next) {
	if (typeof(req.session.user_id) == "number") {
		next();
	} else {
		res.send('You are not authorized!');
	}
}

var entries = [];
var users = [];
var comments = [];

//sample data
entries.push(new Link(entries.length, "Title", "Author", "http://www.google.ch"));
var comment = new Comment(0, "TestComment", "Author");
comments.push(comment);
var comment2 = new Comment(1, "Test Comment 2", "Author2");
comments.push(comment2);
comment.comments.push(comment2);

entries[0].comments.push(comment);
entries[0].createTime = new Date(new Date().getTime() - 40 * 24 * 60 * 60 * 1000);
entries.push(new Link(entries.length, "Title 2", "Author 2", "http://www.heise.de"));

//default user
users.push(new User(users.length, "a", "a") );

function findUser(name) {
	return users.filter(function(user){ return user.name == name; })[0];
}

function returnIndex(res, id, array) {
	if (array.length <= id || id < 0) {
		res.statusCode = 404;
		return res.send('Error 404: Not found');
	}
	return res.json(array[id]);
}

app.get('/', function(req, res) {
  res.redirect('client.html');
});

app.get('/client.css', function(req, res){
	res.type('text/css');
	res.send(clientCss);
});

app.get('/login', function (req, res) {
	if (typeof (req.session.user_id) == "number") {
		var username = users[req.session.user_id].name
		res.json(username);
		log("get login: currently logged in: " + username);
		return;
	}
	log("get login: not logged in");
	res.json("");
});

app.post('/login', function (req, res) {
	var post = req.body;  
	var user = findUser(post.name);   

	if( !!user && post.password == user.password)
	{    
		log("post login: login succeeded: " + post.name);
		req.session.user_id = user.id;    
		res.json(true);   
		return;
	} 
	log("post login: login failed: " + post.name);
	res.json(false);
});

app.post('/register', function(req, res) {
	var post = req.body;

	if (typeof(post.name) != "string" || typeof(post.password) != "string" || post.name.length == 0 || post.password.length == 0) {
		log("post register: invalid request");
		res.json(false);
		return;
	}

	if (findUser(post.name)) {
		log("post register: user " + post.name + " is already registered");
		res.json(false);
		return;
	}

	log("post register: user " + post.name + " registered");

	users.push(new User(users.length, post.name, post.password));
	res.json(true);
});

app.get('/users', function (req, res) {
	log("get users: " + users.length);
	res.json(users);
});



app.get('/entries', function (req, res) {
	log("get entries: " + entries.length);
	res.json(entries);
});


app.post('/entry', function(req, res) {
	var newLink = new Link(entries.length, req.body.title, users[req.session.user_id].name, req.body.url); 

	log("post entry: " + req.body.title);

	entries.push(newLink);
	res.json(newLink);
	io.sockets.emit('message', { action: "AddLink", id: newLink.id });
});

app.get('/entry/:id', function(req, res) {
	log("get entry/" + req.params.id);
	returnIndex(res, req.params.id, entries);
});

app.post('/entry/:id/up', checkAuth, function (req, res) {
	log("post entry/" + req.params.id + "/up");
	var entry = entries[req.params.id];
	if (!!entry) {
		res.json(entries[req.params.id].rating._up(req.session.user_id));
		io.sockets.emit('message', { action: "Rated", type: "entry", id: req.params.id });
	}
});

app.post('/entry/:id/down', checkAuth, function (req, res) {
	log("post entry/" + req.params.id + "/down");
	var entry = entries[req.params.id];
	if (!!entry) {
		res.json(entry.rating._down(req.session.user_id));
		io.sockets.emit('message', { action: "Rated", type: "entry", id: req.params.id });
	}
});

app.post('/entry/:id/comment', checkAuth, function (req, res) {
	log("post entry/" + req.params.id + "/comment");
	
	var entry = entries[req.params.id];
	if (!!entry) {
		var newComment = new Comment(comments.length, req.body.text, users[req.session.user_id].name);
		comments.push(newComment);
		entry.comments.push(newComment);
		res.json(newComment);
		io.sockets.emit('message', { action: "AddComment", type: "entry", id: req.params.id });
	}
});

app.get('/comment/:id', function(req, res){
	log("get comment/" + req.params.id);
	returnIndex(res, req.params.id, comments);
});

app.post('/comment/:id/', checkAuth, function (req, res) {
	log("post comment/" + req.params.id);

	var parent = comments[req.params.id];
	if (!!parent) {
		var newComment = new Comment(comments.length, req.body.text, users[req.session.user_id].name);
		comments.push(newComment);
		parent.comments.push(newComment);
		res.json(newComment);
		io.sockets.emit('message', { action: "AddComment", type: "comment", id: req.params.id });
	}
});

app.post('/comment/:id/up', checkAuth, function (req, res) {
	log("post comment/" + req.params.id + "/up");
	var comment = comments[req.params.id];
	if (!!comment) {
		res.json(comment.rating._up(req.session.user_id));
		io.sockets.emit('message', { action: "Rated", type: "comment", id: req.params.id });
	}
});

app.post('/comment/:id/down', checkAuth, function (req, res) {
	log("post comment/" + req.params.id + "/down");
	var comment = comments[req.params.id];
	if (!!comment) {
		res.json(comment.rating._down(req.session.user_id));
		io.sockets.emit('message', { action: "Rated", type: "comment", id: req.params.id });
	}
});

app.post('/logout', function (req, res) {
	log("post logout");
	req.session.user_id  = null; 
	res.json(true);
});

app.use('/', express.static(__dirname + '/public/'));

//socket:
io = io.listen(app.listen(process.env.PORT || 4730));
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
	socket.emit('message', { action: 'connected' });
});

io.sockets.on('disconnect', function (socket) {
	socket.emit('message', { action: 'disconnect' });
});



