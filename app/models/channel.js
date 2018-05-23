var mongoose = require('mongoose');

var channelSchema = mongoose.Schema({
	'channel_name':String,
	'channel_number_of_articles':{type:Number, default:0},
	'channel_added_by':String,
	'channel_articles':Array,
	'channel_id':String,
	'channel_number_of_clicks':{type:Number, default:0},
	'channel_number_of_viewers':{type:Number, default:0},
	'channel_date_added':{type:Date, default:Date.now}
})

module.exports = mongoose.model('Channel',channelSchema)