(function () {

    var root = this;

    requirejs.config({
    	paths: {
    		jquery: 'Libs/jquery-2.0.3',
    		doT: 'Libs/doT',
    		bootstrap: 'Libs/bootstrap/js/bootstrap.min',
    		sammy: 'Libs/sammy'
    	}
    });
})();

define(['ui', 'jquery', 'sammy'], function(ui, $, sammy) {
	ui.init();

	var app = sammy('#content', function(){
		this.get("#/", function(context){
			context.log("showing list of entries");
			ui.showEntries();
		});

	});

	app.run("#/");
});