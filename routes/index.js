
/*
 * GET home page.
 */

var crypto = require('crypto');
var User = require('../module/user.js');
var Post = require('../module/post.js');
var Group = require('../module/group.js');
var iEvents = require('../module/ievent.js');
var Fundevent = require('../module/fund.js');

module.exports = function(app) {
    app.get('/', function(req,res){
        iEvents.get(null,function(err,events){
            if(err){
                events=[];
            }
            if( req.session.user){
                User.get(req.session.user.name,function(err,users){
                    if(users){
                            Group.getGroups(req.session.user.name,true,function(err,groups){
                                if(err) groups=[];
                                console.log(users);
                                if(users.ownGroup.length){
                                    Fundevent.gets(users.ownGroup[0],false,function(err,fundevents){
                                        if(err) fundevents=[];
                                        res.render('index',{title:'首页',users:users,groups:groups,events:events,fundevents:fundevents,bflag:true});
                                    });
                                }else{
                                    res.render('index',{title:'首页',users:users,groups:groups,events:events,bflag:true,fundevents:[]});    
                                }
                            });
                    }       
                });
            }else{
                res.render('index',{title: '首页',events: events });
            }
        });
    });
    app.get('/reg',checkNotLogin);
    app.get('/reg', function(req, res){
        res.render('reg', {title : '用户注册'});
    });
    app.get('/login',checkNotLogin);
    app.get('/login',function(req,res){
        res.render('login',{title: '用户登入'});
    });
    app.post('/login',checkNotLogin);
    app.post('/login',function(req,res){
	if(!req.body.passwod || !req.body.username){
		req.flash('error','cant be empty');
		return res.redirect('/');
	}
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        User.get(req.body.username,function(err,user){
            if(!user) {
                req.flash('error','User not exist.');
                return res.redirect('/login');
            }
            if( user.password != password) {
                console.log( user.password +' ' + password);
                req.flash('error','Password wrong.');
                return res.redirect('/login');
            }
            req.session.user = user;
            if(user.ownGroup.length){
                Fundevent.gets(user.ownGroup[0],false,function(err,fundevents){
                    if(err) fundevents=[];
                    if(fundevents.length){
                        req.session.success = 'Login success';
                        req.flash('success',user.ownGroup[0] + ' 有未处理的充值请求');
                    }else{
                        req.session.success = 'Login success';
                        req.flash('success','Login success.');
                    }
                    res.redirect('/');
                });
            }else{
                req.flash('sucess','登入成功');
                res.redirect("/");
            }
        });
    });
    app.post('/reg',checkNotLogin);
    app.post('/reg', function(req, res){
        if( req.body['password-repeat'] != req.body['password']) {
            req.session.error = 'Password mismatch';
            req.flash('error', 'Password mismatch');
            return res.redirect('/reg');
        }
	console.log(123);
	console.log(req.body.username,req.body.email);

	if( req.body.username === '' || req.body.email === '' || req.body['password-repeat'] === '' || req.body.password === ''){
		req.flash('error','cant be empty');
		return res.redirect('/reg');
	}
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        var newuser = new User({
            name: req.body.username,
            email: req.body.email,
            password: password,
            curfund: 0,
            ownGroup: [],
        });

        User.get(newuser.name,function(err,user){
            if(user){
                err = 'User exists.';
                //req.flash('error',err);
            }
            if(err){
                req.flash('err',err);
                return res.redirect('/reg');
            }
            //if not exist
            newuser.save(function(err){
                if(err){
                    req.session.error = err;
                    req.flash('err',err);
                    return res.redirect('/reg');
                }
                req.session.user = newuser;
                req.session.success = '注册成功';
                req.flash('success','注册成功');
                res.redirect("/");
            });
        });
    });
    app.get('/logout',checkLogin);
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success','登出成功');
        res.redirect('/');
    });
    app.get('/jgroup',checkLogin);
    app.get('/jgroup',function(req,res){
        var username = req.session.user.name;
        Group.getGroupsByQ({$nor:[{"memlist.name":username}]},function(err,grouplist){
            if(err){
                req.flash('error',err);
                return res.redirect("/");
            }
            res.render('jgroup',{title:'加入组',grouplist:grouplist});
        });
    });

    app.post('/jgroup',checkLogin);
    app.post('/jgroup',function(req,res){
        var bc=[];
        if(req.body.selectedgroups.forEach == undefined) bc.push(req.body.selectedgroups);
        else                                             bc = req.body.selectedgroups;
        Group.updates(bc,{$push: {"memlist": {"name":req.session.user.name,"fund":0}}},function(err){
            if(err){
                req.flash('error',err);
                return res.redirect("/");
            }
            req.flash('success','加入成功');
            res.redirect("/");
        });
    });
    app.post('/post',checkLogin);
    app.post('/post',function(req,res) {
        var currentuser = req.session.user;
        var post = new Post(currentuser.name,req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','Publish success.');
            res.redirect('/u/'+currentuser.name);
        });
    });

    app.get('/cgroup',checkLogin);
    app.get('/cgroup',function(req,res){
        /*
        User.gets(function(err,userlist){
            console.log(userlist);
            res.render('cgroup',{title: '创建组', userlist: userlist});
        });
        */
        User.gets('test',function(err,userlist){
            res.render('cgroup',{title: '创建组', userlist: userlist});
        });
    });

    app.post('/cgroup',checkLogin);
    app.post('/cgroup',function(req,res){
        /* missing the selected item
        console.log(req.body.selectedusernames);
        */
        //console.log(req.body.selectedusernames.length);
        var bc=[];
        var memusers = req.body.selectedusernames;
        if( memusers.forEach == undefined ) bc.push(memusers);
        else                                bc = memusers;
        var curuser = req.session.user;
        //memusers.push(curuser.name);
        var memlist=[];
        bc.forEach(function(name){
            var temp = {
                name:name,
                fund:0,
            };
            memlist.push(temp);
        });
        
        var igroup = new Group(req.body.groupname,curuser.name,memlist,0);
        igroup.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect("/");
            }
            //update user.ownGroup field
            curuser.ownGroup.push(req.body.groupname);
            console.log(curuser.ownGroup);
            User.update(curuser.name,{$set:{"ownGroup":curuser.ownGroup}});
            req.flash('success',"添加成功");
            res.redirect("/");
        });
    });

    app.get('/u/:user/egroup/:groupname',checkLogin);
    app.get('/u/:user/egroup/:groupname',function(req,res){
        Group.get(req.params.groupname,function(err,group){
            Fundevent.gets(req.params.groupname,false,function(err,fundevents){
                if(err) fundevents=[];
                res.render('egroup',{title:'管理组',group:group,fundevents:fundevents});
            });
        });
        //res.render('egroup',{title: '管理组',groupname:req.params.groupname,username:req.params.user});    
    });

    app.post('/u/:user/egroup/:groupname',function(req,res){
        //更新组内成员余额
        var bc=[];
        if(req.body.fundmemnames.forEach == undefined){
            bc.push(req.body.fundmemnames);
        }else{
            bc = req.body.fundmemnames;
        }
        var namelist=[],fundamount=[];
        bc.forEach(function(iuser){
            var arr = iuser.split(',',2);
            namelist.push(arr[0]);
            fundamount.push(arr[1]);
        });
        console.log(namelist+'\n'+fundamount);
        Group.updateFundPartial(req.params.groupname,namelist,fundamount,function(err){
            if(err) {
                req.flash('error',err);
                return res.redirect("/");
            }
            Fundevent.updateStatus(namelist,req.params.groupname,function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect("/");
                }
                User.Fundupdate(namelist,fundamount,function(err){
                    if(err){
                        req.flash('error',err);
                        return res.redirect("/");
                    }
                    req.flash('success','处理成功');
                    res.redirect("/");
                });
            });
        });

        //更新fund collection status
        //Fundevent.updateStatus(namelist,req.params.groupname);
        //res.redirect("/");
        //更新用户curfund



    });
    
    app.get('/u/:user/pevent/:groupname',checkLogin);
    app.get('/u/:user/pevent/:groupname',function(req,res){
        Group.get(req.params.groupname,function(err,group){
            if(err){
                console.log(err);
                group = [];
            }
            //group=['fdsafa','fdafdafdad'];
            console.log(group);
            res.render('pevent',{title: '发表', group:group});
        });
    });
    app.post('/u/:user/pevent/:groupname',function(req,res){
        
        //group leader post a event
        var userlist = req.body.groupmemnames;
        var bc=[];
        if( userlist.forEach == undefined )
        {
            bc.push(userlist);    
        }else{
            bc = userlist;
        }
        var ievent = {
            location: req.body.location,
            cost: req.body.cost*1,
            envolvedp: bc,
            username: req.params.user,
            time: new Date(),
        };
        var pevent = new iEvents(ievent);
        pevent.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect("/");
            }

            //update relative group member fund
            //round avg to .1
            var meanvalue = Math.round(pevent.cost/bc.length*10)/10;
            //update group fund
            Group.updatePartial(req.params.groupname,bc,-req.body.cost,function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect("/");
                }
                User.update(bc,{$inc:{"curfund":-meanvalue}},function(err){
                    if(err){
                        req.flash('error',err);
                        return res.redirect("/");    
                    }
                    /*
                    req.flash('success','更新成功');
                    res.redirect("/");
                    */
                    console.log(bc);
                    /*
                    User.getsUser(bc,function(err,results){
                        console.log(results);
                        console.log(123);
                        req.flash('success','更新成功');
                        res.redirect("/"); 
                    });
                    */
                    
                    var userlist = [];
                    req.flash('success','更新成功');
                    res.redirect("/"); 
                    
                    /*
                    bc.forEach(function(username){
                        User.get(username,function(err,users){
                            if(err) console.log(err);
                            userlist.push(users);
                        });
                    });
                    console.log(userlist);
                    */
                });
            });
        });
    });

    app.get('/edit',checkLogin);
    app.get('/edit',function(req,res){
        res.render('edit',{title: '编辑用户'});
    });

    app.get('/u/:user/refund',checkLogin);
    app.get('/u/:user/refund',function(req,res){
        res.render('refund',{title: '用户充值',pdest:req.params.user});
    });
    app.post('/u/:user/refund',function(req,res){
        var time = new Date();
        time = time.toDateString() + ' ' + time.toTimeString().substr(0,9);

        var ufundevent = {
            username: req.params.user,
            type: 'PERSONAL',
            destaccount: req.body.funddest,
            status: 'SUCCESS',
            time:time,
            amount:req.body.fundamount*1,
        };

        var ufevnet = new Fundevent(ufundevent);
        ufevnet.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect("/");
            }
            //update user account fund amount
            User.update(ufundevent.username,{ $inc:{"curfund": ufundevent.amount} },function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect("/");
                }
                req.flash('success','充值成功');
                res.redirect("/");
            });
        });
    });
    app.get('/u/:user/ufund/:group',checkLogin);
    app.get('/u/:user/ufund/:group',function(req,res){
        res.render('refund',{title: '组内充值',pdest:req.params.group});
    });
    app.post('/u/:user/ufund/:group',function(req,res){
        var time = new Date();
        time = time.toDateString() + ' ' + time.toTimeString().substr(0,9);
        var status = 'TO BE CONFIRMED';
        if(req.session.user.ownGroup.length){
            if(req.session.user.ownGroup[0] == req.params.group) status = 'SUCCESS';
        }
        console.log(status);
        var ufundevent = {
            username: req.params.user,
            type: 'GROUP',
            destaccount: req.body.funddest,
            status: status,
            time:time,
            amount:req.body.fundamount*1,
        };

        console.log(ufundevent);

        var ufevnet = new Fundevent(ufundevent);
        ufevnet.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect("/");
            }
            if(status == 'SUCCESS'){
                var namelist=[],amount=[];
                namelist.push(req.params.user);
                amount.push(ufundevent.amount);
                console.log(namelist+','+amount);
                Group.updateFundPartial(req.params.group,namelist,amount,function(err){
                    if(err){
                        req.flash('error',err);
                        return res.redirect("/");
                    }
                    User.Fundupdate(namelist,amount,function(err){
                        if(err){
                            req.flash('error',err);
                            return res.redirect("/");
                        }
                        req.flash('success','充值成功');
                        res.redirect("/");
                    });
                });
            }else{
                req.flash('success','充值申请已发送,等待组长确认');
                res.redirect("/");
            }
        });
    });
    app.get('/u/:user',checkLogin);
    app.get('/u/:user',function(req,res){
        User.get(req.params.user,function(err,user){
            if(!user){
                req.flash('error','User not exists.');
                return res.redirect('/');
            }
            Group.getGroups(user.name,true,function(err,groups){
                if(err) groups = [];
                iEvents.get(user.name,function(err,cevents){
                    if(err) cevents=[];
                    var thesame = false;
                    if(user.name == req.session.user.name) thesame = true;
                    Fundevent.gets(user.name,true,function(err,fevents){
                        if(err) fevents=[];
                        res.render('user',{
                            title: '个人主页',
                            cevents:cevents,
                            fevents:fevents,
                            groups:groups,
                            users:user,
                            bflag:false,
                            aflag:thesame,
                        });
                    });
                });
            });
        });
    });
    function checkNotLogin(req,res,next){
        if(req.session.user){
            req.flash('error','Already logged in.');
            return res.redirect('/');
        }
        next();
    }
    function checkLogin(req,res,next){
        if(!req.session.user){
            req.flash('error','Not log in.');
            return res.redirect('/login');
        }
        next();
    }
    return app.router;
};
