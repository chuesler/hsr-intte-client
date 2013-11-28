define('dataservice', ['jquery', 'core'], function ($) {

	var dataservice = {
		entry: {
			getAll: function(callback) {
				$.getJSON('entries', callback);
			},
			get: function(id, callback) {
				$.getJSON('entry/' + id, callback);
			},
			vote: function(id, direction){

			}
		},
		user: {
			loggedInUser: undefined,
			isLoggedIn: function(){
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
				$.post("login", { name: username, password: password }, function(success){
					if (success === true) {
						$.event.trigger({ type: "login", name: username });
					}
				});
			},
			logout: function() {
				$.post("logout", function(data) { 
					$.event.trigger({ type: "logout" }); 
				});
			}
		}
	}

	return dataservice;
    
});
