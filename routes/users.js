const express = require('express');
const router = express.Router();
const models = require('../models');

// [get] signup
router.get('/signup', (req, res, next) => {
  res.render('signup',{title: "新規登録"});
});

// [get] login
router.get('/login', (req, res, next) => {
  res.render('login',{title: "ログイン"});
});

// [post] logout
router.post('/logout', (req, res, next) => {
  delete req.session.user
  res.redirect('/users/login')
})

// [post] signup
router.post('/signup', (req, res, next) => {
  console.log(req.body)
  models.User.create({
    userName: req.body.name,
    userEmail: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.password_confirmation
  })
  .then((result) => {
    console.log(result)
    let email = result.dataValues.userEmail;
    req.session.user = email;
    res.redirect('/')
  })
  .catch((error) => {
    console.error(error.message);
    res.render('signup', {
      name: req.body.name,
      email: req.body.email,
      error: "登録に失敗しました。"
    })
  })
})

// [post] login
router.post('/login', (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  models.User.findOne({
    where: {userEmail: email}
  })
  .then((user) => {
    if(user.userPasswordHash === password){
      req.session.user = email;
      res.redirect('/')
    }else{
      console.log('Wrong password.')
      res.render('login',{
        email: email,
        error: "認証に失敗しました。"
      })
    }
  })
  .catch((error) => {
    console.error(error.message);
    res.render('login',{
      email: email,
      error: "認証に失敗しました。"
    })
  })
})
module.exports = router;
