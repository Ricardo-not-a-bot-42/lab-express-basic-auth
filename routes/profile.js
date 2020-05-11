const express = require('express');
const bcrypt = require('bcryptjs');
const loginProtection = require('./../middleware/loginProtection');
const User = require('./../models/user');

const profileRouter = new express.Router();

profileRouter.get('/', loginProtection, (req, res, next) => {
  res.render('./profile/profile');
});

profileRouter.get('/edit', loginProtection, (req, res, next) => {
  res.render('./profile/edit');
});

profileRouter.post('/edit', (req, res, next) => {
  const updatedDetails = {
    username: req.body.username,
    name: req.body.name,
  };
  User.findByIdAndUpdate(req.session.userId, updatedDetails)
    .then(() => {
      res.redirect('/profile');
    })
    .catch((error) => {
      next(error);
    });
});

profileRouter.get('/change-password', loginProtection, (req, res, next) => {
  res.render('./profile/change-password');
});

profileRouter.post('/change-password', (req, res, next) => {
  const passwords = {
    oldPasword: req.body.oldPassword,
    newPassword: req.body.newPassword,
  };
  let user;
  User.findById(req.session.userId)
    .then((document) => {
      user = document;
      return bcrypt.compare(passwords.oldPasword, user.password);
    })
    .then((comparison) => {
      if (comparison) {
        return bcrypt.hash(passwords.newPassword, 10);
      } else {
        const error = new Error('Actual password is incorrect');
        return Promise.reject(error);
      }
    })
    .then((hashAndSalt) => {
      return User.findByIdAndUpdate(req.session.userId, {
        password: hashAndSalt,
      });
    })
    .then(() => {
      req.session.destroy();
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

profileRouter.get('/delete', loginProtection, (req, res, next) => {
  res.render('./profile/edit');
});

profileRouter.post('/delete', (req, res, next) => {
  console.log('deleted');
  User.findByIdAndDelete(req.session.userId)
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = profileRouter;
