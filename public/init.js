(function () {

    var root = this;

    requirejs.config({
    	paths: {
    		jquery: 'Libs/jquery-2.0.3',
    		doT: 'Libs/doT',
    		bootstrap: 'Libs/bootstrap/js/bootstrap.min.js'
    	}
    });

})();

define(['ui'], function(ui) {
	ui.init();
});