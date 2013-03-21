
/**
 * Module dependencies.
 */

var express = require('express')
  , settings = require('./settings')
  , routes = require('./routes')
  , user = require('./routes/user')
  , partials = require('express-partials')
  , flash = require('connect-flash')
  , MongoStore = require('connect-mongo')(express)
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3090);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(partials());
  app.use(flash());
  app.use(express.cookieParser());
  app.use(express.session({
      secret: settings.cookieSecret,
      store: new MongoStore({
          db: settings.db
      })
  }));
  app.use(function(req,res,next){
      res.locals.user = req.session ? req.session.user : '';
      res.locals.error = req.session ? req.flash('error'): '';
      res.locals.success = req.session ? req.flash('success') : '';
      res.locals.info = req.sesion ? req.flash('info') : '';
      next();
  });
  app.use(routes(app));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
