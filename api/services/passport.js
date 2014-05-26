var passport    = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcrypt');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOneById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOneByEmail(username).exec(function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, { message: 'Incorrect User'}); }
      bcrypt.compare(password, user.password, function(err, res) {
        if (!res) return done(null, false, { message: 'Invalid Password'});
        return done(null, user);
      });
    });
  })
);

module.exports = passport;