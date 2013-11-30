(function () {
    requirejs.config({
    	paths: {
    		jquery: 'Libs/jquery-2.0.3',
    		doT: 'Libs/doT',
    		bootstrap: 'Libs/bootstrap/js/bootstrap.min',
    		sammy: 'Libs/sammy',
    		'socket.io': '/socket.io/socket.io'
    	}
    });
})();

define(['ui', 'jquery', 'sammy', 'socket.io'], function(ui, $, sammy, io) {
	ui.init();

	var socket = io.connect('http://localhost:4730');
	socket.on('message', function(message){
		console.log('websocket', message.action);
	});

	var app = sammy("body", function(){

		this.get("#/", function(context){ context.log("entries"); ui.showEntries();	});
		this.post("#/login", function(context){ context.log("login"); ui.login(); });
		this.post("#/logout", function(context){ context.log("logout"); ui.logout(); });
		this.get("#/register", function(context){ context.log("register"); ui.showRegistration(); });
		this.post("#/register", function(context){ ui.register(); });
		this.get("#/submit", function(context){ context.log("submit"); ui.showSubmitEntry(); });
		this.post("#/entry", function(context){ context.log("post entry"); ui.postEntry(); this.redirect("#/"); });
		this.get("#/entry/:id", function(context) { var id = this.params['id']; context.log("show entry", id); ui.showEntry(id); });

		this.bind("register-success", function() {
			this.redirect("#/");
		})
	});

	app.run("#/");
});