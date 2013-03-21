var mongo = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;


module.exports = new Db(mongo.db,new Server(mongo.hostname,mongo.port,{}));
