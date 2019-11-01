var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/signup', (req, res, next) => {
  res.render('signup',{title: "SignUp"});
});
router.get('/signin', (req, res, next) => {
  res.render('signin',{title: "SignIn"});
});
module.exports = router;
