const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./../models/user');
const logoutProtection = require('./../middleware/logoutProtection');
const authenticationRouter = new express.Router();

authenticationRouter.get('/sign-up', logoutProtection, (req, res) => {
  res.render('./authentication/sign-up');
});

authenticationRouter.post('/sign-up', (req, res, next) => {
  const accDetails = {
    username: req.body.username,
    password: req.body.password,
  };

  return User.findOne({ username: accDetails.username })
    .then((user) => {
      if (!user) {
        bcrypt
          .hash(accDetails.password, 10)
          .then((hashAndSalt) => {
            return User.create({
              username: accDetails.username,
              password: hashAndSalt,
            });
          })
          .then((newUser) => {
            console.log(newUser);
            res.redirect('/');
          })
          .catch((error) => {
            next(error);
          });
      } else {
        const error = new Error('That username already exists');
        return Promise.reject(error);
      }
    })
    .catch((error) => {
      next(error);
    });
});

authenticationRouter.get('/sign-in', logoutProtection, (req, res) => {
  res.render('./authentication/sign-in');
});

authenticationRouter.post('/sign-in', (req, res, next) => {
  const loginDetails = {
    username: req.body.username,
    password: req.body.password,
  };
  let user;
  User.findOne({ username: loginDetails.username })
    .then((document) => {
      user = document;
      return bcrypt.compare(loginDetails.password, user.password);
    })
    .catch((error) => {
      return Promise.reject(new Error('Username not found'), error);
    })
    .then((comparison) => {
      if (comparison) {
        console.log('Logged in:', comparison);
        req.session.userId = user._id;
        res.redirect('/profile');
      } else {
        return Promise.reject(new Error('Password is incorrect'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

authenticationRouter.post('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = authenticationRouter;
