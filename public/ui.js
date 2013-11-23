(function($) {

	templates = {}
	templates.links = doT.template($("#template-link").text());

	jQuery.getJSON("http://localhost:4730/entries/", function(data){
		$.each(data, function(index, entry) {
			$("#links").append(templates.links(entry));
		});
	});

})(jQuery);
