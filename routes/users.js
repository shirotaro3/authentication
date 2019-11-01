var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/signup', (req, res, next) => {
  res.render('signup',{title: "新規登録"});
});
router.get('/login', (req, res, next) => {
  res.render('login',{title: "ログイン"});
});
module.exports = router;
