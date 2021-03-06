/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema:true,

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6
    },
    email: {
      type: 'string',
      email: true,
      unique: true,
      required: true
    },
    // Add a reference to User
    projects: {
        collection: 'project',
        via: 'members',
        dominant:true
    },
    toJSON: function(){
      var obj = this.toObject()
      delete obj.password;
      delete obj.admin;
      delete obj._csrf;
      return obj;
    }
  },

  validation_messages: {
    name: {
        required: 'you have to specify a name'
    },
    email: {
      email: 'invalid email, bro',
      unique: 'email alreay exists, don\'t try to use the same email to signup again',
      required: 'you have to specify a email'
    },
    password:{
      required: "you forgot the password",
      minLength: "password too short! 6 charater at minimum"
    }
  },

  beforeCreate: function (attrs, next) {
    var bcrypt = require('bcrypt');

    bcrypt.genSalt(10, function(err, salt) {
      /* istanbul ignore next */
      if (err) return next(err);

      bcrypt.hash(attrs.password, salt, function(err, hash) {
        /* istanbul ignore next */
        if (err) return next(err);

        attrs.password = hash;
        next();
      });
    });
  }
};

