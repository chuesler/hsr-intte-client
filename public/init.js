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
		$.event.trigger({ type: message.action.toLowerCase(), what: message.type, id: message.id });
	});

	var app = sammy("body", function(){
		this.get("#/", function(ctx){ ui.showEntries();	});
		this.post("#/login", function(ctx){ ui.login(); });
		this.post("#/logout", function(ctx){ ui.logout(); });
		this.get("#/register", function(ctx){ ui.showRegistration(); });
		this.post("#/register", function(ctx){ ui.register(); });
		this.get("#/submit", function(ctx){ ui.showSubmitEntry(); });
		this.post("#/entry", function(ctx){ ui.postEntry(); this.redirect("#/"); });
		this.get("#/entry/:id", function(ctx) { ui.showEntry(this.params['id']); });
		this.get("#/reply/:id", function(ctx) { ui.showCommentInput(this.params['id'])});

		this.get("#/entry/:id/:direction", function(ctx){ ui.voteEntry(this.params['id'], this.params['direction']); });
		this.get("#/comment/:id/:direction", function(ctx){ ui.voteComment(this.params['id'], this.params['direction']); });

		this.bind("register-success", function() {
			this.redirect("#/");
		})
	});

	app.run("#/");
});