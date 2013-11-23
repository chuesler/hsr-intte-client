(function($) {

	var templates = {};

	templates.links = doT.template($("#template-link").text());

	jQuery.ajax({
		type:"get", 
		contentType: "application/json; charset=utf-8", 
		url: "entries/", 
		dataType: "json", 
		success: function(data){
			$.each(data, function(entry) {
				$("#links").append(templates.links(entry));
			});
		},
		error: function(e) { throw e; }
	});
   
})(jQuery);
