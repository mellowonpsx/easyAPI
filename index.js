'use strict';
var Hapi = require('hapi');

var server = new Hapi.Server();
var server_ip_address = 'localhost';
var server_port = 8080;

var config = {
  'secrets' : {
    'clientId' : 'CXI4CRFF54H2ZK3KHK2YV2TKQ4MTT5L2UFHD1J05PBNZUCGX',
    'clientSecret' : 'GOLCG1TOHOC0Q0451SYOLUDUAN34B2AGEQKPLRFYDBZTXM3R',
    'redirectUrl' : 'http://localhost:8080/callback'
  }
}

var foursquare = require('node-foursquare')(config);

server.connection({
    address: server_ip_address,
    port: server_port,
    routes: {cors: true}
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
    console.log(server.info);
});

server.route({
    method: ['GET'],
    path: '/login',
    config: { auth: false },
    handler: function (request, reply) {
		return reply('authenticate with foursquare!').redirect(foursquare.getAuthClientRedirectUrl());
	}
});

server.route({
    method: ['GET'],
    path: '/callback',
    config: { auth: false },
    handler: function (request, reply) {
		foursquare.getAccessToken({
			code: request.query.code
		},
		function (error, accessToken) {
			if(error) {
				return reply({
					success: false,
					error: {
						code: error.code,
						message: 'An error was thrown: ' + error.message
					}
				});
			}
			else {
				return reply({
					// Save the accessToken and redirect.
					success: true,
					data: {
						accessToken: accessToken
					}
				});
			}
		});
	}
});

server.route({
    method: ['GET'],
    path: '/getRestourants/{ll}',
    handler: function (request, reply){
		var ll = request.params.ll;
		var lat = ll.split(",").shift();
		var lng = ll.split(",").pop();
		//console.log(lat, lng);
		foursquare.Venues.search(lat, lng, '', {categoryId: '4d4b7105d754a06374d81259'}, '', function (error, results){
			if(error) {
				return reply({
					success: false,
					error: {
						code: error.code,
						message: 'An error was thrown: ' + error.message
					}
				});
			}
			else {
				var resultsArray = results.venues;
				resultsArray.sort(function(a, b){
					return (a.location.distance - b.location.distance);
				});
				return reply({
					success: true,
					data: {
						locations: resultsArray
					}
				});
			}
		});
	}
});

server.route({
    method: ['GET'],
    path: '/getRestourants/{ll}/{element}',
    handler: function (request, reply){
		var ll = request.params.ll;
		var lat = ll.split(",").shift();
		var lng = ll.split(",").pop();
		var elm = request.params.element;
		//console.log(lat, lng);
		foursquare.Venues.search(lat, lng, '', {categoryId: '4d4b7105d754a06374d81259'}, '', function (error, results){
			if(error) {
				return reply({
					success: false,
					error: {
						code: error.code,
						message: 'An error was thrown: ' + error.message
					}
				});
			}
			else {
				var resultsArray = results.venues;
				resultsArray.sort(function(a, b){
					return (a.location.distance - b.location.distance);
				});
				return reply({
					success: true,
					data: {
						locations: resultsArray[elm]
					}
				});
			}
		});
	}
});
