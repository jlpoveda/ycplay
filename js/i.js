var Router = Backbone.Router.extend({
    routes: {          
        "foo/:bar" : "paramtest",
        "*action" : "func"
    },
    func: function (action) {
        console.log(action);
    },
    paramtest:function (p) {
        console.log(p);
    }
});

(function ($) {

	Backbone.emulateHTTP = true; // Use _method parameter rather than using DELETE and PUT methods
	Backbone.emulateJSON = true; // Send data to server via parameter rather than via request content
	 

	Video = Backbone.Model.extend({
		id: null,
		title: null,
		category: null,
		description: null,
		author: null,
	    url: function() {
	    	var url='http://gdata.youtube.com/feeds/api/videos/'+this.id+'?v=2&alt=jsonc';
	    	return url;
	    },
	    parse: function(response){
            if(response.data){
            	this.id = response.data.id;
            	this.title = response.data.title;
            	this.category = response.data.category;
            	this.description = response.data.description;
            }
	    }
	});

	// Playlist = Backbone.Collection.extend({
	// 	initialize: function (models, options) {
	// 		this.bind('add', options.view.play)
	// 	}
	// });

	// HistoryVideos = Backbone.Collection.extend({
	// 	initialize: function (models, options) {
	// 		this.bind('add', options.view.play)
	// 	}
	// })

	// Friend = Backbone.Model.extend({
	// 	//Create a model to hold friend atribute
	// 	name: null
	// });

	// Friends = Backbone.Collection.extend({
	// 	//This is our Friends collection and holds our Friend models
	// 	initialize: function (models, options) {
	// 		this.bind("add", options.view.addFriendLi);
	// 	//Listen for new additions to the collection and call a view function if so
	// 	}
	// });

	// AppView = Backbone.View.extend({
	// 	el: $("body"),
	// 	initialize: function () {
	// 		this.friends = new Friends( null, { view: this });
	// 		//Create a friends collection when the view is initialized.
	// 		//Pass it a reference to this view to create a connection between the two
	// 	},
	// 	events: {
	// 		"click #add-friend":  "showPrompt",
	// 	},
	// 	showPrompt: function () {
	// 		var friend_name = prompt("Who is your friend?");
	// 		var friend_model = new Friend({ name: friend_name });
	// 		//Add a new friend model to our friend collection
	// 		this.friends.add( friend_model );
	// 	},
	// 	addFriendLi: function (model) {

	// 		console.log();
	// 		//The parameter passed is a reference to the model that was added
	// 		$("#friends-list").append("<li>" + model.get('name') + "</li>");
	// 		//Use .get to receive attributes of the model
	// 	}
	// });

	// var appview = new AppView;

	new Router();
	Backbone.history.start();

})(jQuery);



var video = new Video({id: 'pxRCQPx2P1A'});
video.set({id: 'pxRCQPx2P1A'});
video.fetch();

console.log(video.toJSON());
