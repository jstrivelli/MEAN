var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function(){
   var db = mongoose.connect('mongodb://localhost:27017/test', function(err){
   	if(err) return err;
   	console.log("Connected to LOCAL database");
   });

   require('../app/models/user.server.model');
   return db;
};
