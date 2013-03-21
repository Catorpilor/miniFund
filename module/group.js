var mongodb = require('./db');

function Group(groupname,author,memlist,fund){
	this.groupname = groupname;
	this.author = author;
	this.memlist = memlist;
	this.fund = fund;
}

module.exports = Group;

Group.prototype.save = function save(callback){
	var igroup = {
		groupname: this.groupname,
		author: this.author,
		memlist: this.memlist,   //[{name:'xxx',fund:100},...etc]
		fund: this.fund,
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('groups',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('groupname');
			collection.insert(igroup,{safe:true},function(err, igroup){
				mongodb.close();
				callback(null,igroup);
			});
		});
	});
};

Group.getGroups = function getGroups(username ,status, callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        
        db.collection('groups',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query={};
            if(status){
            	query = query.constructor({"memlist.name":username});
            }else{
            	query = query.constructor({"author":username});
            }
            collection.find(query).sort({time:-1}).toArray(function(err,docs) {
                mongodb.close();
                if(err){
                    callback(err,null);
                }
                var groups = [];
                docs.forEach(function(doc,index) {
                    var igroup = new Group(doc.groupname,doc.author,doc.memlist,doc.fund);
                    groups.push(igroup);
                });
                callback(null,groups);
            });
        });
    });
};

Group.getGroupsByQ = function getGroupsByQ(query, callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        
        db.collection('groups',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find(query).sort({time:-1}).toArray(function(err,docs) {
                mongodb.close();
                if(err){
                    callback(err,null);
                }
                var groups = [];
                docs.forEach(function(doc,index) {
                    var igroup = new Group(doc.groupname,doc.author,doc.memlist,doc.fund);
                    groups.push(igroup);
                });
                callback(null,groups);
            });
        });
    });
};

Group.get = function get(groupname,callback){
	mongodb.open(function(err,db){
		if(err)
			callback(err);
		db.collection('groups',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({groupname: groupname},function(err,doc){
				mongodb.close();
				if(doc)
				{
					var group = new Group(doc.groupname,doc.author,doc.memlist,doc.fund);
					callback(null,group);
				}else{
					callback(err,null);
				}
			});
		});
	});
};

Group.updatePartial = function updatePartial( groupname, objective, amount, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
		db.collection('groups',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
            
            collection.update({"groupname":groupname},{$inc:{"fund":amount}});
            if(objective.forEach != undefined ){
                var meanvalue = Math.round(amount/objective.length*10)/10;
                objective.forEach(function(names){
                    console.log(names);
                    collection.update({"groupname":groupname,"memlist.name":names},{$inc:{"memlist.$.fund":meanvalue}});    
                });
            }else{
                collection.update({$and:[{"groupname":groupname},{"memlist.name":objective}]},{$inc:{"memlist.$.fund":amount}});
            }
            mongodb.close();
            callback(null);
		});
    });    
};

Group.updateFundPartial = function updateFundPartial( groupname, userlist, amountlist, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('groups',function(err,collection){
            if(err){
                mongodb.close();
                if(callback)
                    return callback(err);
            }
            userlist.forEach(function(names,index){
                console.log(amountlist[index]);
                collection.update({"groupname":groupname,"memlist.name":names},{$inc:{"memlist.$.fund":amountlist[index]*1}});
                collection.update({"groupname":groupname},{$inc:{"fund":amountlist[index]*1}});
            });
            mongodb.close();
            if(callback)
                callback(null);
        });
    });    
};

Group.updates = function updates( grouplist, query, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('groups',function(err,collection){
            if(err){
                mongodb.close();
                if(callback)
                    return callback(err);
            }
            grouplist.forEach(function(groupnames){
                collection.update({"groupname":groupnames},query);
            });
            mongodb.close();
            if(callback)
                callback(null);
        });
    });    
};
