var config = require('./config'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    uri = 'mongodb://localhost/mean-book',
    db = require('mongoose').connect(uri),
    passport = require('passport'),
    flash = require('connect-flash');
	
module.exports = function(){
  var app = express();
  
  // use export NODE_ENV='...' to set the environment string
  if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
  } 
  else if(process.env.NODE_ENV === 'production'){
  	app.use(compress());
  }

  app.use(bodyParser.urlencoded({
  	extended: true
  }));

  app.use(bodyParser.json());
  app.use(methodOverride());

  // This session is used to tell me the behavior of a client, (When they were last logged on)
  app.use(session({
  	saveUninitialized: true,
  	resave: true,
  	secret: config.sessionSecret
  }));

  //This sets the views to look at and be familiar with ejs files
  app.set('views', './app/views');
  app.set('view engine', 'ejs');
  
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());  

  require('../app/routes/index.server.routes.js')(app);
  require('../app/routes/users.server.routes.js')(app);

  // this allows you to use static images, js, css files in the ejs files by looking in the public folder
  app.use(express.static('./public'));

  return app;
}


