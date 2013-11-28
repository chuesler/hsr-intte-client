define('ui', ['dataservice', 'jquery', 'doT', 'core', 'bootstrap'], function(dataservice, $, doT){

	var templates = {};
	templates.link = doT.template($("#template-link").text());

	var ui = {
		templates: {},
		loggedIn: function(user) {
			ui.user = user;
			$("#submitLink").prop("disabled", false);
			$("#nav-login").hide();
			$("#nav-logout").show();
		},
		loggedOut: function(){
			$("#submitLink").prop("disabled", true);
			$("#nav-login").show();
			$("#nav-logout").hide();
		},
		showEntries: function(){
			var that = this;
			dataservice.entry.getAll(function(data){
				var content = $("#content");
				content.empty();

				$.each(data, function(index, entry) {
					content.append(templates.link(entry));
				});

				$("a[id|=link-vote]").click(function(){
					var linkId = $(this).attr("id");
					var matches = linkId.match(/link-vote-(up|down)-(\d+)/);
					$.post("entry/" + matches[2] + "/" + matches[1], function(){
						$.getJSON("entry/" + matches[2], function(data){
							$("#link-rating-" + matches[2]).text(data.rating.value);
						});
					});
				});
			});
		},
		init: function(){
			var that = this;

			$(document).on("login", this.loggedIn);
			$(document).on("logout", this.loggedOut);

			dataservice.user.isLoggedIn(function(loggedIn) { // reset components according to login status
				if (loggedIn) { that.loggedIn(dataservice.user.loggdInUser); } 
				else { that.loggedOut(); }
			});

			$("#login").submit(function(e){
				dataservice.user.login($("#login_name").val(), $("#login_password").val());
				$('.dropdown.open .dropdown-toggle').dropdown('toggle'); // close dropdown
				e.preventDefault();
			});

			$("#logout").submit(function(e){
				$.post("logout", function(data) { that.loggedOut(); });
				e.preventDefault();		
			});
		}
	};

	return ui;

});
