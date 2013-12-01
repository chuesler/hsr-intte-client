
var inMs = { // roughly. don't really care too much about accuracy, tbh
	year: 365 * 24 * 60 * 60 * 1000,
	month: 30 * 24 * 60 * 60 * 1000,
	week: 7 * 24 * 60 * 60 * 1000,
	day: 24 * 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
}

function getTimeAgo(date) {
	var now = new Date().getTime();
	var other = date.getTime();

	if (now < other) {
		throw "date must be in the past";
	}

	var diff = now - other;

	if (diff >= inMs.year) {
		return "over a year ago";
	}

	var months = diff / inMs.month;

	if (months >= 1) {
		return "over " + (months < 2 ? "a month" : Math.floor(months) + " months") + " ago";
	}

	var weeks = diff / inMs.week;

	if (weeks >= 1) {
		return "over " + (weeks < 2 ? "a week" : Math.floor(weeks) + " weeks") + " ago";
	}

	var days = diff / inMs.day;

	if (days >= 1) {
		return "over " + (days < 2 ? "a day" : Math.floor(days) + " days") + " ago";
	}

	if (diff < inMs.hour) {
		return "under an hour ago";
	} else {
		var hours = Math.floor(diff / inMs.hour);
		return  "over " + (hours < 2 ? "an hour" : Math.floor(hours) + " hours") + " ago";
	}
}

module.exports = { getTimeAgo: getTimeAgo };