var mongodb = require('./db');



var Fundevent = function(fundevent){
	this.username = fundevent.username;
	this.type = fundevent.type;
	this.amount = fundevent.amount;
	this.destaccount = fundevent.destaccount;
	this.status = fundevent.status;
	this.time = fundevent.time;
};

module.exports = Fundevent;

Fundevent.prototype.save = function save(callback) {
	// body...
	var fevent = {
		username: this.username,
		type: this.type,
		destaccount:this.destaccount,
		status:this.status,
		time:this.time,
		amount:this.amount,
	};

	mongodb.open(function(err,db){
		if(err) return callback(err);
		db.collection('funds',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('username');
			collection.insert(fevent,{safe:true},function(err,fevent){
				mongodb.close();
				callback(err,fevent);
			});
		});
	});
};

Fundevent.gets = function gets(username,type,callback){
	mongodb.open(function(err,db){
		if(err) return callback(err);

		db.collection('funds',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={};
			if(type) query = query.constructor({"username":username});
			else	 query = query.constructor({"destaccount":username,"status":"TO BE CONFIRMED"});
			collection.find(query).sort({time:-1}).limit(15).toArray(function(err,fevents){
				mongodb.close();
				if(err) callback(err,null);
				var allevents=[];
				fevents.forEach(function(fevent,index){
					var ievent = new Fundevent(fevent);
					allevents.push(ievent);
				});
				callback(null,allevents);
			});	
		});
	});
};

Fundevent.getsUserfgroup = function getsUserfgroup(username,callback){
	mongodb.open(function(err,db){
		if(err) return callback(err);

		db.collection('funds',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={};
			query = query.constructor({"username":username,"type":"GROUP","status":"TO BE CONFIRMED"});
			collection.find(query).sort({time:-1}).toArray(function(err,fevents){
				mongodb.close();
				if(err) callback(err,null);
				var allevents=[];
				fevents.forEach(function(fevent,index){
					var ievent = new Fundevent(fevent);
					allevents.push(ievent);
				});
				callback(null,allevents);
			});	
		});
	});
};


Fundevent.updateStatus = function updateStatus(namelist,groupname,callback){
	mongodb.open(function(err,db){
		if(err) return callback(err);

		db.collection('funds',function(err,collection){
			if(err){
				mongodb.close();
				if(callback)
					return callback(err);
			}
			namelist.forEach(function(names){
				collection.update({"username":names,"destaccount":groupname,"status":"TO BE CONFIRMED"}, {$set:{"status":"SUCCESS"}});
			});
			mongodb.close();
			if(callback)
				callback(null);
		});
	});
};
