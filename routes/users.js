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
  req.session.destroy();
  res.clearCookie('sessionId');
  res.redirect('/users/login');
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
    let userName = result.dataValues.userName;
    req.session.user = userName;
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
  // 認証失敗時のレスポンス
  const authFailure = () => {
    res.render('login',{
      email: email,
      error: "認証に失敗しました。"
    })
  }
  models.User.findOne({
    where: {userEmail: email}
  })
  .then((user) => {
    if(user){
      user.authenticate(password, (result) => {
        if(result === true){
          req.session.user = user.userName
          res.redirect('/')
        }else{
          console.log('Wrong password')
          authFailure()
        }
      })
    }else{
      console.log('User not found');
      authFailure()
    }
  })
  .catch((error) => {
    console.error(error.message);
    authFailure()
  })
})
module.exports = router;
