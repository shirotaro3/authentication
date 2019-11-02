const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const models = require('../models');

router.get('/signup', (req, res, next) => {
  res.render('signup',{title: "新規登録"});
});
router.get('/login', (req, res, next) => {
  res.render('login',{title: "ログイン"});
});

router.post('/signup', (req, res, next) => {
  console.log(req.body)
  models.User.create({
    userName: req.body.name,
    userEmail: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.password_confirmation
  }).then(() => {
    res.redirect('/')
  })
})

module.exports = router;
