var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.email = user.email;
    this.curfund = user.curfund;
    this.password = user.password;
    this.ownGroup = user.ownGroup;
};

module.exports = User;

User.prototype.save = function(callback){
    //save to mongodb file
    var user = {
        name: this.name,
        email: this.email,
        password : this.password,
        curfund : this.curfund,
        ownGroup: this.ownGroup,
    };

    mongodb.open(function(err,db){
        if( err ){
            return callback(err);
        }
        db.collection('users', function(err, collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('name',{unique: true });
            //write
            collection.insert(user, {safe: true}, function(err, user){ 
                mongodb.close();
                callback(err,user);
            });
        });

    });
};

User.get = function get(username, callback){
    //console.log(mongodb);
    mongodb.open(function(err,db){
        if(err){
            callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                callback(err);
            }
            console.log(username);
            collection.findOne({name:username}, function(err,doc){
                mongodb.close();
                if( doc ){
                    //encapsulate user
                    console.log(doc);
                    var user = new User(doc);
                    callback(err,user);
                }else{
                    callback(err,null);
                }
            });
        });
    });
};

User.gets = function gets(query,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //var query={};
            if(query == null ) query={};
            collection.find().toArray(function(err,docs) {
                mongodb.close();
                if(err){
                    callback(err,null);
                }
                var userlist = [];
                docs.forEach(function(doc,index) {
                    var iuser = new User(doc);
                    userlist.push(iuser);
                });
                console.log(callback);
                callback(null,userlist);
            });
        });
    });
};

User.getsUser = function getsUser(userlist,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var selecteduser=[];
            var bcount = 0;
            userlist.forEach(function(username){
                collection.findOne({name:username},function(err,doc){
                    console.log(bcount++);
                    if(doc){
                        var user = new User(doc);
                        bcount++;
                        selecteduser.push(user);
                    }
                });
            });
            mongodb.close();
            if(bcount == userlist.length){
                console.log(bcount+selecteduser);
                callback(null,selecteduser);
            }
        });
    });
};



User.update = function update(username,query,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            if(!query){
                return callback(err);
            }
            if(username.forEach == undefined )
            {
                collection.update({name:username},query,function(err){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                });
            }else{
                username.forEach(function(name){
                    collection.update({name:name},query,function(err){
                        if(err){
                            mongodb.close();
                            return callback(err);
                        }
                    });    
                });
                mongodb.close();
                callback(null);
            }
        });
    });    
};

User.Fundupdate = function Fundupdate(username,amountlist,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            username.forEach(function(name,index){
                collection.update({name:name},{$inc:{'curfund':amountlist[index]*1}});    
            });
            mongodb.close();
            callback(null);
        });
    });    
};

