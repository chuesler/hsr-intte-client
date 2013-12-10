define('dataservice', ['jquery', 'core'], function ($) {

	var dataservice = {
		entry: {
			getAll: function() {
				return $.getJSON('entries');
			},
			get: function(id) {
				return $.getJSON('entry/' + id);
			},
			post: function(title, url) {
				return $.post("entry", { title: title, url: url });
			},
			vote: function(id, direction){
				return $.post("entry/" + id + "/" + direction);
			},
			comment: function(parentId, text) {
				return $.post("entry/" + parentId + "/comment", { text: text });
			}
		},
		comment: {
			get: function(id) {
				return $.getJSON("comment/" + id);
			},
			comment: function(parentId, text) {
				console.log("post comment", parentId, text);
				return $.post("comment/" + parentId, { text: text });
			},
			vote: function(id, direction) {
				return $.post("comment/" + id + "/" + direction);
			}
		},
		user: {
			loggedInUser: undefined,
			checkLoggedIn: function(){
				var that = this;
				if (!!this.loggedInUser) { 
					$.event.trigger({ type: "login", name: loggedInUser });
					return; 
				}
				
				$.getJSON("login", function(data){
					if (typeof(data) == "string" && data !== "") {
						that.loggedInUser = data;
						$.event.trigger({ type: "login", name: data });
					} else {
						$.event.trigger({ type: "logout" });
					}
				});
			},
			login: function(username, password) {
				var that = this;
				$.post("login", { name: username, password: password }, function(success){
					if (success === true) {
						that.loggedInUser = username;
						$.event.trigger({ type: "login", name: username });
					} else {
						$.event.trigger({ type: "login-failed" });
					}
				});
			},
			logout: function() {
				var that = this;
				$.post("logout", function(data) { 
					that.loggedInUser = undefined;
					$.event.trigger({ type: "logout" }); 
				});
			},
			register: function(username, password) {
				$.post("register", {name: username, password: password }, function(success) {
					$.event.trigger({ type: "register-" + (success ? "success" : "failed") });
				});
			}
		}
	}

	return dataservice;

});
