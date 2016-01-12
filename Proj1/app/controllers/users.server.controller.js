//This is a user controller that handles the users operations

var User = require('mongoose').model('User'),
    passport = require('passport');


//This is a private helper method that returns a unified error message from mongoose
// two possible errors MongoDB indexing error handled using error code and a mongoose validation error using err.errors
var getErrorMessage = function(err){
	var message = '';

	if(err.code){
		switch(err.code){
			case 11000:
			case 11001:
				message = 'Username already exists';
				break;
			default:
				message = 'Something went wrong';	
		}
	}	
	else{
		for(var errName in err.errors){
				if(err.errors[errName].message){
				 	message = err.erros[errName].message;
				}
		}
		
	} 
	return message;

};  

//this method is provided by the passport module
exports.renderSignin = function(req, res, next){
	if(!req.user){
		res.render('signin', {
			title: 'Sign-in Form',
			messages: req.flash('error') || req.flash('info')
		});
	}
	else{
		return res.redirect('/');
	}
;}

exports.renderSignup = function(req, res, next){
	if(!req.user){
		res.render('signup', {
			title: 'Sign-up Form',
			messages: req.flash('error'),
		});
	}
	else{
		return res.redirect('/');
	}
};

exports.signup = function(req, res, next){
	if(!req.user){
		// creating a user object
		var user = new User(req.body);
		var message = null;

		user.provider = 'local';

		user.save(function(err){
			if(err){
				// uses helper method if err occurs when trying to create username
				var message = getErrorMessage(err);

				req.flash('error', message);
				return res.redirect('/signup');
			}
			// otherwise it successfully creates a user
			req.login(user, function(err){
				if(err) return next(err);
				return res.redirect('/');
			});
		});
	}
	else{
		return res.redirect('/');
	}
};


//this method accepts a user profile looks for an existing user. If it finds the user it calls the done callback method
//otherwise if it doesnt find a user it calls finduniqueusername to save a new user instance
exports.saveAuthUserProfile = function(req, profile, done){
	User.findOne({
		provider: profile.provider,
		providerId: profile.providerId
	}, function(err, user){
		if(err){
			return done(err);
		}
		else{
			if(!user){
				var possibleUsername = profile.username ||((profile.email) ? profile.email.split('@')[0] : '');

				User.findUniqueUsername(possibleUsername, null, function(availableUsername){
					profile.username = availableUsername;

					user = new User(profile);

					user.save(function(err){
						if(err){
							var message = _this.getErrorMessage(err);

							req.flash('error', message);
							return res.redirect('/signup');
						}

						return done(err, user);
					});
				});
			}
			else{
				return done(err, user);
			}
		}
		});
};		

exports.signout = function(req, res){
	req.logout();
	res.redirect('/');
}; 

// //This is a method that creates a user and then saves the user in the db
// exports.create = function(req, res, next){
//   var user = new User(req.body);
//   user.save(function(err)  {
//      if(err){
//        return next(err);
//      }
//      else{
//       res.json(user);
//      }
//   });
// };


// exports.list = function(req, res, next){
// 	//The third param for find can use skip and limit to look at subsets in specified areas when looking through the database
// 	User.find({}, function(err, users){
// 		if(err){
// 			return next(err);
// 		}
// 		else{
// 			res.json(users);
// 		}
// 	});
// }; 


// exports.read = function(req, res){
// 	res.json(req.user);
// };

// //findOne() similar to find() but only returns the first id of the requested subset in the db
// exports.userByID = function(req, res, next, id){
// 	User.findone({
// 		_id: id
// 	}, function(err, user){
// 	  if(err){
// 	  	return next(err);
// 	  }
// 	  else{
// 	  	req.user = user;
// 	  	next();
// 	  }
// 	});
// };


// //updates an existing user document in the db by userId
// exports.update = function(req, res, next){
// 	User.findByIdAndUpdate(req.user.id, req.body, function(err, user){
// 		if(err){
// 			return next(err);
// 		}
// 		else{
// 			res.json(user);
// 		}
// 	});
// };

// //deletes an existing user document in db by userId
// exports.delete = function(req, res, next){
// 	req.user.remove(function(err){
// 		if(err){
// 			return next(err);
// 		}
// 		else{
// 			res.json(req.user);
// 		}
// 	})		
// };
