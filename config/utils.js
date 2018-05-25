var Channel = require('../app/models/channel');
var User = require('../app/models/pushers');
var Article = require('../app/models/article');
var crypto = require('crypto');
var Pusher = require('pusher');
var config = require('../config/config');


function Utils(){
	
	function create_cookie(req,res){
		var user = req.cookies.user? req.cookies.user: null;
		var cookie = user? user: crypto.createHmac('sha256', 'instantly').update(Date.now().toString()).digest('hex');
		res.cookie('user',cookie,{maxAge:31536000000, httpOnly:true})
		return {user:user,cookie:cookie};
	}

	function save_user(cookie_data,return_value){
		var new_user = new User();
		new_user.user_id = cookie_data.cookie;
		new_user.save(function(err,savedUser){
			if(err)
				throw err;
			console.log('successfully saved new user with id '+ cookie_data.cookie);
			return_value();
		});
	}

	function check_channel_exists(channel,return_value){
		Channel.findOne({channel_name:channel},function(err,channel){
			if(err)
				throw err;
			if(channel){
				return_value(true);
			}
			else{
				return_value(false);
			}
		})
	}



	function update_user(req,data,response,return_value){
		User.findOne({user_id:req.cookies.user},function(err,user){
			if(err)
				throw err;
			for (info in data){
				var property = Object.keys(data[info])[0];
				var value = data[info][property];
				user[property].push(value);
			}
			
			user.save(function(err,updated_user){
				if(err)
					throw err;
				if(updated_user){
					return_value(response);
				}
				else{
					return_value({});
				}
			})
		})
	}

	function save_channel(req,return_value){
		var new_channel = new Channel();
		new_channel['channel_name'] = req.body.channel_name;
		new_channel['channel_added_by'] = req.cookies.user;
		new_channel['channel_id'] = crypto.createHmac('sha256', req.cookies.user).update(req.body.channel_name).digest('hex');
		new_channel.save(function(err,saved_channel){
			if(err)
				throw err;
			if(saved_channel){
				return_value(saved_channel);
			}
			else{
				return_value(false);
			}
		})
	}

	function get_channels(return_value){
		Channel.find({},function(err,channels){
			if(err)
				throw err;
			return_value(channels);
		})
	}

	function get_articles(return_value){
		Article.find({},function(err,articles){
			if(err)
				throw err;
			return_value(articles);
		})
	}

	function save_article(req,return_value){
		Article.findOne({'article_url':req.body['article_url']},function(err,found){
			if(err)
				throw err;
			if(found){
				return_value({'article_exists':'this article already exists'});
			}
			else{
				var new_article = new Article();
				new_article['article_title'] = req.body['article_title'];
				new_article['article_url'] = req.body['article_url'];
				new_article['article_author'] = req.body['article_author'];
				new_article['article_channel'] = req.body['article_channel'];
				new_article['article_id'] = crypto.createHmac('sha256', req.cookies.user).update(req.body['article_url']).digest('hex');
				new_article.save(function(err,saved_article){
					if(err)
						throw err;
					var user_data = [{'user_articles_added':saved_article['article_id']},{'user_names':req.body.name}]
					var channel_data = [{'channel_articles':saved_article['article_id']}]
					update_channel(saved_article['article_channel'], channel_data, function(){
						update_user(req,user_data,saved_article,return_value)
					})
				})
			}
		})
		
	}

	function update_channel(channel,data,return_value){
		Channel.findOne({'channel_name':channel},function(err,found_channel){
			if(err)
				throw err;
			if(!found_channel){
				return_value({'channel':'Channel not found'})
			}
			else{
				for(var i = 0; i < data.length; i++){
					if(data[i]['channel_articles']){
						found_channel['channel_articles'].push(data[i]['channel_articles']);
					}
					else{
						var property = Object.keys(data[i])[0];
						found_channel[property] += 1;
					}
				}
				found_channel.save(function(err,updated_channel){
					if(err)
						throw err;
					return_value();
				})
			}
		})
	}

	function today(){
		var date = new Date();
		var hours = date.getHours() * 60 * 60 * 1000;
		var minutes = date.getMinutes() * 60 * 1000;
		var seconds = date.getSeconds() * 1000;
		var milliseconds = date.getMilliseconds();
		var time = hours + minutes + seconds + milliseconds;
		return time;
	}

	function pusher(channel,event,data){
		var pusher = new Pusher({
		  appId: config['APP_ID'],
		  key: config['APP_KEY'],
		  secret: config['APP_SECRET'],
		  cluster: config['APP_CLUSTER'],
		  encrypted: config['APP_ENCRYPTION'],
		});
		console.log('we are about to trigger the event to check')
		console.log(data);
		pusher.trigger(channel, event,data);
	}

	function update_article(article_id,data,return_value){
		Article.findOne({'article_id':article_id},function(err,found_article){
			if(err)
				throw err;
			var property = Object.keys(data)[0];
			var value = Number(data[property]) == 1 || Number(data[property]) == -1 ? Number(data[property]) : 0;
			found_article[property] += value;
			found_article.save(function(err,updated_article){
				if(err)
					throw err;
				return_value(updated_article);
			})
		})
	}

	return {
		create_cookie: create_cookie,
		save_user: save_user,
		check_channel_exists:check_channel_exists,
		save_channel:save_channel,
		update_user: update_user,
		get_channels:get_channels,
		save_article:save_article,
		get_articles:get_articles,
		update_channel: update_channel,
		update_article: update_article,
		today: today,
		pusher: pusher,
	};
}

module.exports = Utils();