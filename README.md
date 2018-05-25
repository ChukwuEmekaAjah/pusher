# INSTANTLY
A project submitted for the Dev.to competition on how the Pusher channels API can be utilized in different ways.

# DESCRIPTION
We are always on the web and we somehow get to come across great articles that are worth sharing with other developers that may be interested in such content. This app is a real-time developers' board to see new and interesting articles being read and shared by other developers organised according to channels. This means that you can focus only on articles that are under the channels that you are interested in. An example of a channel may be 'reactjs' or 'angularjs'.

# HOW IT WORKS
When you see an article online and you feel it is worth sharing, come on to this platform and click on the /addarticle link. It provides a user interface to add the article title, the channel closely related to it, the author, the article url and your name for recognition. Once the form is submitted, everyone who is viewing articles on the platform receives the new update in real-time without refreshing their browser.
Also, if the channel that you are interested in is not on the platform, you can add it from the /addchannel link and it would be updated in real-time to those viewing the available channels without a page refresh.
Also, whenever a user views an article or likes an article, it is updated in real-time on all devices viewing the /articles endpoint without a page refresh.

# TOOLS USED
The app was built with NodeJS/ExpressJS stack with MongoDB for data persistence (database). The Pusher channels API is utilized for the real-time communication between the server and the client. For the front-end, I used jQuery and MaterializeCSS for the front-end logic and UI manipulation respectively.
