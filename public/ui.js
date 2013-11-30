define('ui', ['dataservice', 'jquery', 'doT', 'sammy', 'core', 'bootstrap'], function(dataservice, $, doT, sammy){

	var templates = {};
	templates.link = doT.template($("#template-link").text());
	templates.message = doT.template($("#template-message").text());

	function showError(message) {
		$("#content").prepend($(templates.message(message)).addClass("alert-danger"));
	}

	function showMessage(message) {
		var msg = $(templates.message(message)).addClass("alert-info");
		$("#content").prepend(msg);	
		setTimeout(function(){ msg.remove(); }, 5000); // autoremove after 5s
	}

	function hideAll() {
		$("#content > .alert").remove();
		$("#content > div").addClass("hidden");
	}

	function show(what) {
		$(what).removeClass("hidden");
	}

	function initLogin(ui) {
		$(document).on("login", function(user) {
			ui.user = user;
			$("#submitLink").attr("href", "#/submit").removeClass("disabled");
			$("#nav-login").hide();
			$("#nav-logout").show();
		});

		$(document).on("login-failed", function(){
			showError("<strong>Login failed</strong>: Invalid username or password.");
		})
		
		$(document).on("logout", function (){
			$("#submitLink").removeAttr("href").addClass("disabled");
			$("#nav-login").show();
			$("#nav-logout").hide();
		});

		dataservice.user.checkLoggedIn();
	}

	function initRegister(ui){
		$(document).on("register-success", function(){
			console.log("registration successful");
			sammy("body").trigger("register-success");
			showMessage("<strong>Registration successful</strong>!")
		});

		$(document).on("register-failed", function(){
			console.log("registration failed");
			showError("<strong>Registration failed</strong>: Make sure you provided both a username and a password, or try a different username.");
		});
	}

	function renderEntries(entries) {
		$("#entries").empty();

		$.each(entries, function(index, entry) {
			$("#entries").append(templates.link(entry));
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
	}

	var ui = {
		showEntries: function(){
			hideAll();
			dataservice.entry.getAll().then(function(data){
				renderEntries(data);
				show("#entries");
			});
		},
		showRegistration: function(){
			hideAll();
			show("#registration");
		},
		showSubmitEntry: function(){
			hideAll();
			show("#submitEntry");
			$("#submitEntry form input[type='text']").val('');
		},
		showEntry: function(id){
			hideAll();
		},
		login: function() {
			dataservice.user.login($("#login_name").val(), $("#login_password").val());
			$('.dropdown.open .dropdown-toggle').dropdown('toggle'); // close dropdown
		},
		logout: function(){
			dataservice.user.logout();
		},
		register: function() {
			dataservice.user.register($("#register_name").val(), $("#register_password").val());
		},
		postEntry: function() {
			dataservice.entry.post($("#entry_title").val(), $("#entry_url").val());
		},
		init: function(){
			initLogin(this);
			initRegister(this);

			$("#register-form").submit(function(e) {
				dataservice.user.register($("#register_name").val(), $("#register_password").val());
				e.preventDefault();
			});

		}
	};

	return ui;

});
