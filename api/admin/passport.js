const Passport = require('passport');
const config = require('../../config');
const { User } = require('../models');
const { createUAAStrategy } = require('../services/uaaStrategy');

const passport = new Passport.Passport();

const uaaOptions = config.passport.uaa.adminOptions;

const verify = async (accessToken, _refreshToken, profile, callback) => {
  const { email } = profile;

  try {
    const user = await User.findOne({ where: { adminEmail: email } });

    if (!user) {
      return callback(null, false);
    }

    return callback(null, user);
  } catch (err) {
    return callback(err);
  }
};

const uaaStrategy = createUAAStrategy(uaaOptions, verify);

passport.use('uaa', uaaStrategy);

passport.serializeUser((user, next) => {
  next(null, user.id);
});

passport.deserializeUser((id, next) => {
  User.findByPk(id).then((user) => {
    next(null, user);
  });
});

passport.logout = (req, res) => {
  req.logout();
  res.redirect(uaaStrategy.logoutRedirectURL);
};

module.exports = passport;
