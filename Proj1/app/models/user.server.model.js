var mongoose = require('mongoose'),
	crypto = require('crypto'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  //match is a regex operator to make sure the user types the email with proper format
  email: {
  	type: String,
  	index: true,
  	match: [/.+\@.+\..+/ , "Please fill a valid e-mail address"]
  },	
  //username will use predefined modifiers built with mongoose to trim and remove whitespace. Has to be a unique username
  username: {
  	type: String,
  	trim: true,
  	unique: true,
  	required: 'Username is required'
  },
  // validate is a custom validator that requires a specfic length for the password
  password: {
  	type: String,
  	validate: [
  		function(password){
  			return password.length >= 6;
  		},
  		'Password must be longer than 6 characters'
  	]
  },
  salt: {
  	type: String
  },
  //indicates the strategy used to register the user
  provider:{
  	type: String,
  	required: 'Provider is required'
  },
  //indicates the user identifier for the authentication strategy
  providerId: String,
  //used to store the user object which is obtained from OAuth providers
  providerData: {},
  //created will tell us when a user created a db document
  created:{
  	type: Date,
  	default: Date.now
  }
});


//virtual attributes for the schema presentation
UserSchema.virtual('fullname').get(function(){
	return this.firstName + ' ' + this.lastName;

}).set(function(fullname){
	var splitname = fullname.split(' ');
	this.firstName = splitName[0] || '';
	this.lastName = splitName[1] || '';
});

//this is a pre middleware that encrypts a users password before saving it to the database
UserSchema.pre('save', function(next){
	if(this.password){
		this.salt = new 
		  Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);  
	}

	next();
});

UserSchema.methods.hashPassword = function(password){
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};


//Authentification method allows db to secure users
UserSchema.methods.authenticate = function(password){
	return this.password === password;
}


UserSchema.statics.findUniqueUsername = function(username, suffix, callback){
	var_this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user){
		if(!err){
			if(!user){
				callback(possibleUsername);
			}
			else{
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		}
		else{
			callback(null);
		}
	});
};

UserSchema.set('toJSON', {getters: true, virtuals: true});

mongoose.model('User', UserSchema);

// var postSchema = new Schema({
// 	title: {
// 		type: String,
// 		required: true
// 	},
// 	content: {
// 		type: String, 
// 		required: true
// 	},
// 	author: {
// 		type: Schema.ObjectID,
// 		ref: 'User'
// 	}
// });

// mongoose.model('Post', postSchema);
