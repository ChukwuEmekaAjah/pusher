var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	'user_names':Array,
	'date_joined':{type:Date, default:Date.now},
	'user_id':String,
	'user_articles_added':Array,
	'user_articles_liked':Array,
	'user_dates_visited':Array,
})

module.exports = mongoose.model('User',userSchema)