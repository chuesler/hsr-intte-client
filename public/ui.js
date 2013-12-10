﻿define('ui', ['dataservice', 'jquery', 'doT', 'sammy', 'core', 'bootstrap'], function(dataservice, $, doT, sammy){

	var templates = {};
	templates.entry = doT.template($("#template-entry").text());
	templates.message = doT.template($("#template-message").text());
	templates.comment = doT.template($("#template-comment").text());
	templates.reply = doT.template($("#template-reply").text());

	function showError(message) {
		$("#content").prepend($(templates.message(message)).addClass("alert-danger"));
	}

	function showMessage(message) {
		var msg = $(templates.message(message)).addClass("alert-info");
		$("#content").prepend(msg);	
		setTimeout(function(){ msg.remove(); }, 5000); // autoremove after 5s
	}

	function hide(what) {
		$(what).addClass("hidden");
	}

	function show(what) {
		$(what).removeClass("hidden");
	}

	function hideAll() {
		$("#content > .alert").remove();
		hide("#content > div");
	}

	function applyLoginState() {
		if (!!dataservice.user.loggedInUser) {
			$("a[id*='-vote-']").each(function(_, element){
				var [_, type, direction, id] = element.id.match(/(entry|comment)-vote-(up|down)-(\d+)/);
				$(this).attr("href", "#/" + type + "/" + id + "/" + direction);
				$(element).children("img").attr("src", "assets/arrow_" + direction + ".png");
			});

			$("a[id*='-reply-']").each(function(_, element){
				var [_, type, id] = element.id.match(/(entry|comment)-reply-(\d+)/);
				$(this).attr("href", "#/reply/" + type + "/" + id);
			});
		} else {
			$("a[id*='-vote-']").removeAttr("href")
				.filter("[id*='up']").children("img").attr("src", "assets/arrow_up_grey.png").end().end()
				.filter("[id*='down']").children("img").attr("src", "assets/arrow_down_grey.png");
			$("a[id*='-reply-']").removeAttr("href");
			$("#reply").remove();
		}
	}

	function initLogin(ui) {
		$(document).on("login", function(user) {
			$("#user-name > span").text(user.name);
			$("#submitLink").attr("href", "#/submit").removeClass("disabled");
			
			hide("#nav-login");
			show("#nav-logout");

			applyLoginState();
		});

		$(document).on("login-failed", function(){
			showError("<strong>Login failed</strong>: Invalid username or password.");
		})
		
		$(document).on("logout", function(){
			$("#submitLink").removeAttr("href").addClass("disabled");
			show("#nav-login");
			hide("#nav-logout");

			applyLoginState();
		});

		dataservice.user.checkLoggedIn();
	}

	function initRegister(ui){
		$(document).on("register-success", function(){
			sammy("body").trigger("register-success");
			showMessage("<strong>Registration successful</strong>!")
		});

		$(document).on("register-failed", function(){
			showError("<strong>Registration failed</strong>: Make sure you provided both a username and a password, or try a different username.");
		});
	}

	function sortByRating(a, b) { // createTime is a string at this point - json ftw
		return a.rating.value == b.rating.value ? b.createTime.localeCompare(a.createTime) : b.rating.value - a.rating.value;
	}

	var ui = {
		showEntries: function(){
			hideAll();
			dataservice.entry.getAll().then(function(data){
				$("#entries").empty();
				$.each(data.sort(sortByRating), function(index, entry) {
					$("#entries").append(templates.entry(entry));
				});

				applyLoginState();

				show("#entries");
			});
		},
		showRegistration: function(){
			hideAll();
			show("#registration");
		},
		showSubmitEntry: function(){
			$("#submitEntry form input[type='text']").val('');
			hideAll();
			show("#submitEntry");
		},
		showEntry: function(id){
			hideAll();
			dataservice.entry.get(id).then(function(entry) {
				entry.single = true;
				var newEntry = templates.entry(entry);
				$("#showEntry").empty().append(newEntry).append("<p/>");
			
				var renderChildren = function(parentId, comment){
					$("#comment-children-" + parentId).append(templates.comment(comment));
					$(comment.comments.sort(sortByRating)).each(function(index, child){ renderChildren(comment.id, child); });
				};

				$(entry.comments.sort(sortByRating)).each(function(index, comment){
					$("#showEntry").append(templates.comment(comment));
					$(comment.comments).each(function(index, child){ renderChildren(comment.id, child); });
				});

				applyLoginState();

				show("#showEntry");
			});
		},
		showCommentInput: function(type, id) {
			$("#reply").remove();
			$((type === "entry" ? "#showEntry > div:first-child div:last-child" : "#comment-reply-" + id))
				.after(templates.reply({ type: type, id: id }));
		},
		voteEntry: dataservice.entry.vote,
		voteComment: dataservice.comment.vote,
		login: function() {
			dataservice.user.login($("#login_name").val(), $("#login_password").val());
			$('.dropdown.open .dropdown-toggle').dropdown('toggle'); // close dropdown
			$("#login input[type!='submit']").val('');
		},
		logout: function(){
			dataservice.user.logout();
		},
		register: function() {
			dataservice.user.register($("#register_name").val(), $("#register_password").val());
			$("#registration input[type!='submit']").val('');
		},
		postEntry: function() {
			dataservice.entry.post($("#entry_title").val(), $("#entry_url").val());
		},
		postComment: function(type, id) {
			dataservice[type].comment(id, $("#reply-text").val());
			$("#reply").remove();
		},
		init: function(){
			initLogin(this);
			initRegister(this);

			$("#register-form").submit(function(e) {
				dataservice.user.register($("#register_name").val(), $("#register_password").val());
				e.preventDefault();
			});

			$(document).on("rated", function(e){
				var rating = $("#" + e.what + "-rating-" + e.id);
				console.log("rating", e, rating);
				if (rating.size()) {
					var s = dataservice[e.what];
					console.log("service", s);
					dataservice[e.what].get(e.id).then(function(data){
						console.log("result", data);
						rating.text(data.rating.value);
					});
				}
			});

			$(document).on("addlink", function(e){
				var entries = $("#entries");
				if (entries.length == 1 && !entries.hasClass("hidden")){
					dataservice.entry.get(e.id).then(function(entry){
						entries.append(templates.entry(entry));
					});
				}
			});

			$(document).on("addcomment", function(e){
				console.log("addcomment", e);
				dataservice.comment.get(e.id).then(function(comment){
					$(e.what === "entry" ? "#showEntry" : "#comment-children-" + e.parent).append(templates.comment(comment));	
				});
			});
		}
	};

	return ui;

});
