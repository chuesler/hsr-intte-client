define('ui', ['dataservice', 'jquery', 'doT', 'core'], function(dataservice, $, doT){

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
		updateLinks: function(){
			var that = this;
			$.getJSON("entries/", function(data){
				var newLinks = $("<div class=\"container\" id=\"container\"/>");
				$.each(data, function(index, entry) {
					newLinks.append(that.templates.links(entry));
				});
				$("#content").replaceWith(newLinks);

				$("a[id|=link-vote]").click(function(){
					var linkId = $(this).attr("id");
					var matches = linkId.match(/link-vote-(up|down)-(\d+)/);
					$.post("entry/" + matches[2] + "/" + matches[1], function(){
						jQuery.getJSON("entry/" + matches[2], function(data){
							$("#link-rating-" + matches[2]).text(data.rating.value);
						});
					});
				});
			});
		},
		init: function(){
			this.templates.links = doT.template($("#template-link").text());
			var that = this;

			$.getJSON("login", function(data){ // reset components according to login status
				if (typeof(data) == "string" && data !== "") {
					that.loggedIn(data);
				} else {
					that.loggedOut();
				}
			});

			this.updateLinks();

			$("#login").submit(function(e){
				var user = $("#login_name").val();
				jQuery.post("login", { name: user, password: $("#login_password").val() }, function(data){
					if (data === true){
						that.loggedIn(user);
					}
					$('.dropdown.open .dropdown-toggle').dropdown('toggle');
				});
				e.preventDefault();
			});

			$("#logout").submit(function(e){
				jQuery.post("logout", app.loggedOut);
				e.preventDefault();		
			});
		}
	};

	return ui;

});
