# MongoDB Adapter Module for Simple OData Server 

## Description:
This module is an modern implementation of a MongoDB Adapter that can be used to interact with mongodb when using the simple-odata-server module of pofider and bjrmatos.

The simple-odata module can be found under the following links:

[NPM](https://www.npmjs.com/package/simple-odata-server)  
[GitHub](https://github.com/pofider/node-simple-odata-server#readme)

## Usage:
The Adapter can be applied to an odata server in the follwing way:

    const MongoAdapter = require("simple-odata-mongodb");
    MongoClient.connect(url, function(err, db) {
		odataServer.adapter(MongoAdapter(function(cb) { 
			cb(err, db.db('odatadb')); 
		})); 
	});


## Implementation provided by SWS Computersysteme:
[HomePage](https://www.sws.de/)
