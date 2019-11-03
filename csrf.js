const express = require('express');
const router = express.Router();
const csrf = require('csrf');
const tokens = new csrf();

// [get] sessionとcookieにcsrf対策文字列を保存
router.get('/', (req, res, next) => {
  
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  
  // デバッグ用
  console.log(secret)
  console.log(token)
  
  req.session._csrf = secret;
  res.cookie('_csrf', token);

  res.render('login');
});

// [post] sessionとcookieにある_csrf文字列を検証(verify)
router.post('/', (req, res, next) => {
  
  const secret = req.session._csrf;
  const token = req.cookies._csrf;

  if(!tokens.verify(secret, token)){
    throw new Error('Invalid token');
  }

  // session & cookieを削除
  delete req.session._csrf;
  res.clearCookie('_csrf');
});

module.exports = router;