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
		// console.log('websocket', message);
		$.event.trigger({ type: message.action.toLowerCase(), what: message.type, id: message.id, parent: message.parent });
	});

	var app = sammy("body", function(){
		var app = this;
		this.quiet = false;

		this.after(function(){
			app.quiet = false;
		});

		this.quietRoute = function(location) {
			app.quiet = true;
			app.setLocation(location);
		};

		this.get("#/", function(ctx){ ui.showEntries();	});
		this.post("#/login", function(ctx){ ui.login(); });
		this.post("#/logout", function(ctx){ ui.logout(); });
		this.get("#/register", function(ctx){ ui.showRegistration(); });
		this.post("#/register", function(ctx){ ui.register(); });
		this.get("#/submit", function(ctx){ ui.showSubmitEntry(); });
		this.post("#/entry", function(ctx){ ui.postEntry(); this.redirect("#/"); });
		this.get("#/entry/:id", function(ctx) { if (app.quiet) { return; } ui.showEntry(this.params.id); });
		this.get("#/reply/:type/:id", function(ctx) { ui.showCommentInput(this.params.type, this.params.id); });
		this.post("#/reply/:type/:id", function(ctx) { 
			console.log(this.params); 
			ui.postComment(this.params.type, this.params.id); 
			app.quietRoute("#/entry/" + this.params.id); 
		});
		this.get("#/entry/:id/:direction", function(ctx){ 
			ui.voteEntry(this.params.id, this.params.direction); 
			app.quietRoute("#/entry/" + this.params.id);
		});
		this.get("#/comment/:id/:direction", function(ctx){ 
			ui.voteComment(this.params.id, this.params.direction); 
			app.quietRoute("#/entry/" + this.params.id);
		});

		this.bind("register-success", function() {
			this.redirect("#/");
		})
	});

	app.run("#/");
});