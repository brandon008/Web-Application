const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');


function register(username, email, password, errorCallback, successCallback) {

  if (username.length < 8 || password.length < 8){
    return errorCallback({message: "USERNAME PASSWORD TOO SHORT" });
  }

  User.findOne({username: username}, (err, result) => { 
    
    if(!result){ // no user was found
      
      bcrypt.hash(password, 10, function(err, hash) {
        const newUser = new User({
          username: username,
          email: email,
          password: hash 
        });
  
        newUser.save(function(err, result){
          if(err){

            errorCallback({message: "DOCUMENT SAVE ERROR" });
  
          }
          if(result){
            successCallback(result);
          }
        });
      });
    }

    if (result){ // found user 
      return errorCallback({message: "USERNAME ALREADY EXISTS" });
    }
  });
}

function login(username, password, errorCallback, successCallback) {

  User.findOne({username: username}, (err, user) => {
    if (!err && user) {

      bcrypt.compare(password, user.password, (err, match) => {
        if(match === true){
          successCallback(user);

        }else{
          errorCallback({message: "PASSWORDS DO NOT MATCH"});
        }

      });
            // compare with form password!
    }else{
      errorCallback({message: "USER NOT FOUND" });
    }
  });

}

function startAuthenticatedSession(req, user, cb) {

  req.session.regenerate((err) =>{
    if(!err){ // success
      req.session.user = user;
      cb();
    } else{
      console.log(err);
    }
  });
}



module.exports = {
  startAuthenticatedSession: startAuthenticatedSession,
  register: register,
  login: login
};
