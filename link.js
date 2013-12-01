var Rating = require('./rating.js');
var DateUtils = require('./dateutils.js');

module.exports = function Link(id, title, author, url) {
	var that = this;
    this.id = id;
    this.title = title;
    this.author = author;
    this.url = url;
    this.createTime = new Date();
    this.createTimeDisplay = { toJSON: function() { return DateUtils.getTimeAgo(that.createTime); }};
    this.rating = new Rating();
    this.comments = [];
};

