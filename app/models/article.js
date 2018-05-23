var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
	'article_title':String,
	'article_url':String,
	'article_author':String,
	'article_added_by':String,
	'article_channel':String,
	'date_added':{type:Date, default:Date.now},
	'article_id':String,
	'article_number_of_clicks':{type:Number, default:0},
	'article_number_of_likes':{type:Number, default:0},
	
})

module.exports = mongoose.model('Article',articleSchema)