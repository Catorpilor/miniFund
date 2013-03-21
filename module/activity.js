var mongodb = require('./db');


function iEvents(ievent) {
	this.location = ievent.location;
	this.cost = ievent.cost;
	this.envolvedp = ievent.envolvedp;
    this.username = ievent.username;
	if(time)
		this.time = ievent.time;
	else
		this.time = new Date();
};

module.exports = iEvents;


iEvents.prototype.save = function save( callback ) {
	// body...
	var devent = {
		location: this.location,
		cost:  this.cost,
		envolvedp: this.envolvedp,
		time: this.time,
        username: this.username,
	};

	mongodb.open(function(err,db) {
		if(err){
			return callback(err);
		}
		db.collection('ievents',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('location');
			collection.insert(devent,{safe:true},function(err,devent){
				mongodb.close();
				callback(null,devent);
			});
		});
	});
};

iEvents.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('ievents',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={};
			if(username)
				query.envolvedp = username;
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err)
					callback(err,null);
				var pevens=[];
				docs.forEach(function(doc,index){
                    if(index < 10){
                        var ievent = new iEvents(doc);
                        pevens.push(ievents);
                        //breakkk;
                    }
				});
				callback(null,pevens);
			});
		});
	});
};
