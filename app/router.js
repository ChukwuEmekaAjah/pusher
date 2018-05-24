var Article = require('../app/models/article');
var Channel = require('../app/models/channel');
var User = require('../app/models/pushers');
var Utils = require('../config/utils');
var crypto = require('crypto');
var Pusher = require('pusher');

function route(app,mongoose){
	//===========================
	//============================
	// THIS HANDLES THE RENDERING OF STATIC DOCUMENTS SUCH AS THE HOME PAGE AND THE ABOUT PAGE.
	app.get('/',function(req,res){
		var cookie_data = Utils.create_cookie(req,res);
		Utils.save_user(cookie_data,function(){
			res.render('index');
		});
		
				
	})

	app.get('/addchannel',function(req,res){
		// there are many routes to the app, incase a first-time user comes directly to this link
		var cookie_data = Utils.create_cookie(req,res);
		Utils.save_user(cookie_data,function(){
			res.render('addchannel');
		});
	})
	
	app.post('/addchannel',function(req,res){
		// we would check if the channel already exists
		// check for the user id
		// add the new channel and use pusher to update on the front end.
		var cookie_data = Utils.create_cookie(req,res);
		if(!cookie_data){
			Utils.save_user(cookie_data,'addchannel',res);
		}
		else{
			var channel_exists = Utils.check_channel_exists(req.body.channel_name,function(channel_exists){
				if(channel_exists){
					res.send('that channel already exists')
				}
				else{
					var saved_channel = Utils.save_channel(req,function(saved_channel){
						if(saved_channel){
							res.redirect('/channels');
							res.on('finish',function(){
								Utils.pusher('channel','new',saved_channel);
							})
						}
						else{
							res.send('there was a problem saving the channel')
						}
					});	
				}
			})
		}
		
	})

	app.get('/addarticle',function(req,res){
		// get request for the add article page.
		var cookie_data = Utils.create_cookie(req,res);
		Utils.save_user(cookie_data,function(){
			Utils.get_channels(function(channels){
				var channels = channels.map(function(channel){
					return channel['channel_name'];
				});
				res.render('addarticle',{channels:channels});

			})
		});
	});

	app.post('/addarticle',function(req,res){
		var cookie_data = Utils.create_cookie(req,res);
		Utils.save_user(cookie_data,function(){
			Utils.save_article(req,function(success){
				if(Object.keys(success)){
					if(success.article_id){
						res.redirect('/articles');
						res.on('finish',function(){
							Utils.pusher('article','new',success)
						})
					}
					else{
						res.send(success['article_exists'])

					}
				}
				else{
					res.send('the process was not successful, try again')
				}
			})
		})
	})

	app.get('/channels',function(req,res){
		// we would show the channel name
		// number of articles in the channel
		// number of articles added today
		// date the channel was created.
		if(req.query.channel){
			var cookie_data = Utils.create_cookie(req,res);
			Utils.save_user(cookie_data,function(){
				Utils.get_articles(function(articles){
					var mapped_articles = articles.filter(function(article){
						if(article['article_channel'] == req.query.channel){
							return true;
						}
					})	
					res.render('articles',{articles:mapped_articles});
				}) 
			})
		}
		else{
			var cookie_data = Utils.create_cookie(req,res);
			Utils.save_user(cookie_data,function(){
				Utils.get_channels(function(channels){
					Utils.get_articles(function(articles){
						var mapped_channels = channels.map(function(channel){
							return {'channel_date_added':channel['channel_date_added'], 'channel_name':channel['channel_name'],'number_of_articles':channel['channel_number_of_articles'],'number_of_clicks':channel['channel_number_of_clicks']};
						})
						var final_output = mapped_channels.map(function(channel){
							var counter = 0;
							var today = Utils.today();
							for(var i = 0; i<articles.length; i++){
								if(articles[i]['article_channel'] == channel['channel_name'] && articles[i]['date_added'] > today ){
									counter += 1;
								}
							}
							channel['added_today'] = counter;
							channel['channel_date_added'] = (new Date(channel['channel_date_added'])).toLocaleDateString();
							console.log(channel['channel_date_added'])
							return channel
						})
						res.render('channels',{channels:final_output});
					})
				})
			})
		}
		
	})

	app.get('/articles',function(req,res){
		var cookie_data = Utils.create_cookie(req,res);
		Utils.save_user(cookie_data,function(){
			Utils.get_articles(function(articles){
				res.render('articles',{articles:articles});
			})
		})
	})

}
module.exports = route;
