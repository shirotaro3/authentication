const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const models = require('../models');

const csrfProtection = csrf({ cookie: true });
const parseForm = express.urlencoded({ extended: false })

// [get] signup
router.get('/signup', csrfProtection, (req, res, next) => {
  res.render('signup',{title: "新規登録", csrfToken: req.csrfToken() });
});

// [get] login
router.get('/login', csrfProtection, (req, res, next) => {
  res.render('login',{title: "ログイン", csrfToken: req.csrfToken() });
});

// [post] logout
router.post('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('sessionId');
  res.redirect('/users/login');
})

// [post] signup
router.post('/signup', parseForm, csrfProtection, (req, res, next) => {
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
      csrfToken: req.csrfToken(),
      error: "登録に失敗しました。"
    })
  })
})

// [post] login
router.post('/login', parseForm, csrfProtection, (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  // 認証失敗時の処理
  const authFailure = () => {
    res.render('login',{
      email: email,
      csrfToken: req.csrfToken(),
      error: "認証に失敗しました。"
    })
  }
  models.User.findOne({
    where: {userEmail: email}
  })
  .then((user) => {
    if(user){
      user.authenticate(password, (result) => {
        // ログイン成功
        if(result === true){
          req.session.user = user.userName
          const ref = req.cookies.ref
          console.log(ref);
          if(ref){
            res.redirect(ref);
          }else{
          res.redirect('/')
          }
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
