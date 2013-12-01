var Rating = require('./rating.js');
var DateUtils = require('./dateutils.js');

module.exports = function Comment(id, text, author) {
	var that = this;
    this.id = id;
    this.text = text;
    this.author = author;
    this.createTime = new Date();
    this.createTimeDisplay = { toJSON: function() { return DateUtils.getTimeAgo(that.createTime); }};
    this.rating = new Rating();
    this.comments = [];
};

