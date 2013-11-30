define('core', ['jquery'], function ($) {
	$.support.cors = true;
	//TODO create db service
	//window.data = $.fn.DataService();  //exist till the site is changed
	//sessionStorage.dataService = $.fn.DataService();  //stores data for one session
	//localStorage.dataService = $.fn.DataService();  //stores data with no expiration date
	
	$.ajaxSetup({
		cache: false
	});

	/**
	* @method Throws an argument exception if the given flag is false.
	**/
	$.fn.assertIsTrue = function (strArgumentName, blnMustBeTrue) {
		strArgumentName = String(strArgumentName);
		if (!blnMustBeTrue) {
			var errorObj = {
				message: 'The given argument "' + strArgumentName + '" contains a value which value is out of range.',
				argument: strArgumentName,
				toString: function () {
					return this.message;
				}
			};
			throw errorObj;
		}
	};


	if (!String.prototype.format) {
		String.prototype.format = function() {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] != 'undefined' ? args[number] : match;
			});
		};
	}

	});
